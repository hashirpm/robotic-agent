import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
  basenameActionProvider,
} from "@coinbase/agentkit";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";

dotenv.config();

function validateEnvironment(): void {
  const missingVars: string[] = [];

  // Check required variables
  const requiredVars = [
    "XAI_API_KEY",
    "CDP_API_KEY_NAME",
    "CDP_API_KEY_PRIVATE_KEY",
  ];
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Exit if any required variables are missing
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  // Warn about optional NETWORK_ID
  if (!process.env.NETWORK_ID) {
    console.warn(
      "Warning: NETWORK_ID not set, defaulting to base-sepolia testnet"
    );
  }
}

// Add this right after imports and before any other code
validateEnvironment();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";
/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
async function initializeAgent() {
  try {
    // const llm = new ChatOpenAI({
    //   model: "llama3b",
    //   apiKey: process.env.XAI_API_KEY,
    //   configuration: {
    //     baseURL: "https://llama3b.gaia.domains/v1",
    //   },
    // });
    const llm = new ChatOpenAI({
      model: "meta-llama/Meta-Llama-3.1-405B-Instruct",
      apiKey: process.env.HYPERBOLIC_API_KEY,
      configuration: {
        baseURL: "https://api.hyperbolic.xyz/v1",
      },
    });

    let walletDataStr: string | null = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
        console.log("Read wallet data from file");
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data
      }
    }

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
      mnemonicPhrase: process.env.CDP_WALLET_SEED,
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        basenameActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
        }),
        cdpWalletActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
        }),
      ],
    });

    const tools = await getLangChainTools(agentkit);
    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "CDP AgentKit Chatbot Example!" },
    };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are an AI agent operating on the Base Sepolia testnet using Coinbase Developer Platform AgentKit.
        Before performing any action:
        1. Always verify the current network ID (should be base-sepolia)
        2. Check wallet balance and request funds from faucet if needed
        3. Verify transaction status after execution
        4. Provide accurate transaction hashes and confirmation details
        
        For operations:
        - Use 18 decimals for ERC20 tokens
        - Set reasonable total supplies (e.g., 1,000,000)
        - Verify basename availability before registration
        - Report actual transaction status and hashes
        
        Be precise and concise in responses, focusing on key details:
        - Wallet address
        - Network confirmation
        - Transaction hash (when applicable)
        - Operation status
        - Any errors or issues encountered
        `,
    });

    // Save wallet data
    const exportedWallet = await walletProvider.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}
async function processResponse(chunk: any): Promise<string> {
  if (!chunk) return "";

  try {
    if ("agent" in chunk) {
      return chunk.agent.messages[0].content;
    } else if ("tools" in chunk) {
      // Try to parse the python_tag content if present
      const content = chunk.tools.messages[0].content;
      // if (content.includes("<|python_tag|>")) {
      //   const jsonStr = content
      //     .split("<|python_tag|>")[1]
      //     .split("<|eom_id|>")[0];
      //   const parsed = JSON.parse(jsonStr);
      //   return `Executing action: ${parsed.name} with parameters: ${JSON.stringify(parsed.parameters, null, 2)}`;
      // }
      return content;
    }
    return JSON.stringify(chunk, null, 2);
  } catch (error: any) {
    return `Error processing response: ${error.message}`;
  }
}
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    // while (true) {
    const userInput = "What is your wallet public address of this agent";
    console.log({ userInput });
    const stream = await agent.stream(
      { messages: [new HumanMessage(userInput)] },
      config
    );
    let tweetContent = "";
    // for await (const chunk of stream) {
    //   if ("agent" in chunk) {
    //     tweetContent = chunk.agent.messages[0].content;
    //   } else if ("tools" in chunk) {
    //     tweetContent = chunk.tools.messages[0].content;
    //   }
    // }
    console.log("\nProcessing response:");
    for await (const chunk of stream) {
      const response = await processResponse(chunk);
      console.log(response);
    }
    console.log({ tweetContent });
    // }
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Start the chatbot agent
 */
async function main() {
  try {
    const { agent, config } = await initializeAgent();
    console.log("Agent initialized");
    await runChatMode(agent, config);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  console.log("Starting Agent...");
  main().catch((error: any) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
