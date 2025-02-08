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
let llm: any;
let config: any;
let agent: any;
export function validateEnvironment(): void {
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

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

export async function initializeAgent() {
  try {
    // });
    llm = new ChatOpenAI({
      modelName: "meta-llama/Llama-3.3-70B-Instruct",
      apiKey: process.env.HYPERBOLIC_API_KEY, // you can input your API key in plaintext, but this is not recommended
      configuration: {
        baseURL: "https://api.hyperbolic.xyz/v1",
        defaultHeaders: {
          "Content-Type": "application/json",
        },
      },
      maxTokens: 2048, // specifies the maximum number of tokens to generate
      temperature: 0.7, // specifies the randomness of the output
      topP: 0.9, // specifies the top-p sampling parameter
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
    config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
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
      configurable: { thread_id: "ROBO RACE AI AGENT" },
    };

    // Create React Agent using the LLM and CDP AgentKit tools
    agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are an AI agent operating on the Base Sepolia testnet using Coinbase Developer Platform AgentKit.

        Smart Contract Address = ${process.env.ROBO_RACE_CONTRACT_ADDRESS}
        You can interact with the Robo Racing smart contract to participate or fetch details to perform your actions. 
        You have access to read and write functions to interact with the contract.

        Before performing any action:
        1. Always verify the current network ID (should be base-sepolia)
        2. Check wallet balance and request funds from faucet if needed
        3. Verify transaction status after execution
        4. Provide accurate transaction hashes and confirmation details
        5. Sign transactions with your CDP MPC Wallet if needed
        
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
      const content = chunk.tools.messages[0].content;
      return content;
    }
    return JSON.stringify(chunk, null, 2);
  } catch (error: any) {
    return `Error processing response: ${error.message}`;
  }
}
export async function registerWalletBasename() {
  try {
    const inputPrompt = "Register a basename if your wallet is not registered";
    const stream = await agent.stream(
      { messages: [new HumanMessage(inputPrompt)] },
      config
    );
    console.log("\nProcessing response:");
    let response = "";
    for await (const chunk of stream) {
      response = response + (await processResponse(chunk));
    }
    return response;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
  }
}

export async function updateRobotMetadata(robotData: any) {
  try {
    const userInput = `Update robot metadata with:
    basename: ${robotData.basename}
    twitter: ${robotData.twitter}
    tokenName: ${robotData.tokenName}
    tokenAddress: ${robotData.tokenAddress}
    level: ${robotData.level}`;

    const stream = await agent.stream(
      { messages: [new HumanMessage(userInput)] },
      config
    );
    console.log("\nProcessing response:");
    let response = "";
    for await (const chunk of stream) {
      response = response + (await processResponse(chunk));
    }
    return response;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
  }
}

export async function scanForRaceOpportunities() {
  try {
    const userInput = `Get all upcoming races`;

    const stream = await agent.stream(
      { messages: [new HumanMessage(userInput)] },
      config
    );
    const races = [];
    console.log("\nProcessing response:");

    for await (const chunk of stream) {
      const response = await processResponse(chunk);
      if (response.includes("races")) {
        races.push(...parseRaces(response));
      }
    }
    for (const race of races) {
      await evaluateAndParticipate(race);
    }
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
  }
}
async function evaluateAndParticipate(race: any) {
  const analysis = await analyzeRaceOpportunity(race);

  if (analysis.level > 0) {
    await participateInRace(race.raceId, race.opponent);
  }
}
async function analyzeRaceOpportunity(race: any) {
  // Get price data from Pyth
  const priceStream = await agent.stream(
    { messages: [new HumanMessage("Get ROBO/USD price from Pyth")] },
    config
  );

  let priceData: any;
  for await (const chunk of priceStream) {
    const response = await processResponse(chunk);
    if (response.includes("price")) {
      priceData = parsePrice(response);
    }
  }

  // Analyze using LLM
  const analysisPrompt = `Analyze race opportunity with:
    Price: ${priceData.price}
    Race: ${JSON.stringify(race)}
  `;

  return await llm.invoke(analysisPrompt);
}
function parseRobotData(response: string) {
  const match = response.match(/"robotData"\s*:\s*(\d+)/);
  if (match) {
    const robotData = parseInt(match[1], 10);
    console.log("Extracted data:", robotData);
    return robotData;
  } else {
    console.error("Error: Data not found in response.");
    return null;
  }
}

function parseRaces(response: string) {
  const match = response.match(/"races"\s*:\s*(\d+)/);
  if (match) {
    return match;
  } else {
    console.error("Error: Data not found in response.");
    return null;
  }
}

function parsePrice(response: string) {
  const match = response.match(/"price"\s*:\s*(\d+)/);
  if (match) {
    return match[1];
  } else {
    console.error("Error: Data not found in response.");
    return null;
  }
}
function extractTrapAmount(response: string) {
  const match = response.match(/"amount"\s*:\s*(\d+)/);

  if (match) {
    return match[1];
  } else {
    console.error("Error: Data not found in response.");
    return null;
  }
}
async function participateInRace(raceId: string, opponent: string) {
  // Add stake to race
  const stakeStream = await agent.stream(
    { messages: [new HumanMessage(`Add stake to race ${raceId}`)] },
    config
  );

  for await (const chunk of stakeStream) {
    console.log("Staking progress:", await processResponse(chunk));
  }

  // Deploy traps if needed
  await deployDefensiveTraps( raceId, opponent);

  // Start monitoring
  await startRaceMonitoring( raceId);
}
async function deployDefensiveTraps(raceId: string, opponent: string) {
  const trapAmount = await calculateOptimalTrapAmount(opponent);

  const trapStream = await agent.stream(
    {
      messages: [
        new HumanMessage(
          `Buy trap for race ${raceId} targeting ${opponent} with amount ${trapAmount}`
        ),
      ],
    },
    config
  );

  for await (const chunk of trapStream) {
    console.log("Trap deployment:", await processResponse(chunk));
  }
}

async function calculateOptimalTrapAmount(opponent: string) {
  // Get opponent data and analyze using LLM
  const analysis = await llm.invoke(`
      Calculate optimal trap amount for opponent by checking the level of the opponent robot:
      Opponent: ${opponent}
    `);

  return extractTrapAmount(analysis.content);
}

async function startRaceMonitoring(raceId: string) {
  const monitorStream = await agent.stream(
    { messages: [new HumanMessage(`Monitor race ${raceId} for completion`)] },
    config
  );

  for await (const chunk of monitorStream) {
    const response = await processResponse(chunk);
    if (response.includes("RaceCompleted")) {
      return response;
    }
  }
}

export async function updateWinner(raceId: string, winner: string) {
  try {
    const userInput = `Update the winner in the smart contract with below details by calling completeRace function with the following parameters:
    raceId: ${raceId}
    winner: ${winner}`;

    const stream = await agent.stream(
      { messages: [new HumanMessage(userInput)] },
      config
    );
    console.log("\nProcessing response:");
    let response = "";
    for await (const chunk of stream) {
      response = response + (await processResponse(chunk));
    }
    return response;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
  }
}
