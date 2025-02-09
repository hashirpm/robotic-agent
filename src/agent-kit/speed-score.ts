import { ChatOpenAI } from "@langchain/openai";
import { Profile } from "agent-twitter-client";
import {
  getProfileOfAnAccount,
  getTweetsOfAnAccount,
} from "../scrapers/twitter";
import { getPrompt } from "../nillion-helpers/ai-config";
import { getAPIKey } from "../nillion-helpers/api-key";

async function performAIAnalysis(
  profile: any,
  tweets: any,
  hiddenAbilities: any
) {
  const llm = new ChatOpenAI({
    model: "meta-llama/Llama-3.3-70B-Instruct",
    apiKey: (await getAPIKey("hyperBolicApiKey")) || process.env.HYPERBOLIC_API_KEY,
    configuration: {
      baseURL: "https://api.hyperbolic.xyz/v1",
    },
    maxTokens: 512,
    temperature: 0.1,
    topP: 0.9,
  });
  const inputPrompt = await getPrompt("performAnalysisPrompt");
  const analysisPrompt = `${inputPrompt}
Input Data for Analysis:
Profile Information: ${profile}
Recent Tweets: ${tweets}
Hidden Abilities: ${hiddenAbilities}
`;
  try {
    const response = await llm.invoke(analysisPrompt);
    console.log(response.content);
    const match = response.content.toString().match(/"score"\s*:\s*(\d+)/);
    if (match) {
      const score = parseInt(match[1], 10);
      console.log("Extracted Score:", score);
      return score;
    } else {
      console.error("Error: Score not found in response.");
      return null;
    }
  } catch (error) {
    console.error("Error parsing AI analysis:", error);
  }
}

export async function generateSpeedScore(
  twitterUsername: string,
  hiddenAbilities?: string[]
) {
  console.log(`Analyzing username: ${twitterUsername}`);
  const profileData = await getProfileOfAnAccount(twitterUsername);
  const tweetsData = await getTweetsOfAnAccount(twitterUsername);
  console.log({ profileData });
  console.log({ tweetsData });
  const analysis = await performAIAnalysis(
    profileData,
    tweetsData,
    hiddenAbilities || []
  );

  return analysis;
}
