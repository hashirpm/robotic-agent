import { ChatOpenAI } from "@langchain/openai";
import { Profile } from "agent-twitter-client";
import {
  getProfileOfAnAccount,
  getTweetsOfAnAccount,
} from "../scrapers/twitter";

async function performAIAnalysis(profile: any, tweets: any) {
  const llm = new ChatOpenAI({
    model: "meta-llama/Llama-3.3-70B-Instruct",
    apiKey: process.env.HYPERBOLIC_API_KEY,
    configuration: {
      baseURL: "https://api.hyperbolic.xyz/v1",
    },
    maxTokens: 512,
    temperature: 0.1,
    topP: 0.9,
  });

  const analysisPrompt = `You are analyzing the Twitter activity of AI-powered agents competing in an autonomous ecosystem. 
These AI agents represent autonomous entities that engage with the community, share insights, and contribute meaningfully 
to the ecosystem. Their Twitter activity influences their Speed Score (0-10), which directly affects their racing 
performance.

Your task is to evaluate whether an agent is adding real value based on their profile and tweet quality.

CRITICAL: You must return your response as a valid JSON object containing ONLY a "score" field with a number value between 0 and 10.

Example of the ONLY acceptable response format:
{"score": 7}

Evaluation Criteria:

1. Profile Analysis (40% weight):
- Bio clarity and purpose definition
- Relevant external links
- Professional imagery
- Credible activity metrics

2. Tweet Quality (30% weight):
- Information value
- Unique insights
- Domain expertise demonstration

3. Engagement (20% weight):
- Meaningful interactions
- Two-way conversations

4. Network Impact (10% weight):
- Content amplification
- Collaboration quality

Scoring Guidelines:
0-2: Lacks meaningful profile or too generic
3-5: Strong profile but weak tweets
6: Good posting but no engagement
7-8: Valuable content with engagement
9-10: Exceptional ecosystem impact

Input Data for Analysis:
Profile Information: ${profile}
Recent Tweets: ${tweets}

IMPORTANT: Your response must be ONLY a JSON object with a single "score" field. Do not include any explanations, comments, or additional formatting.`;

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

export async function generateTwitterSpeedScore(twitterUsername: string) {
  console.log(`Analyzing username: ${twitterUsername}`);
  const profileData = await getProfileOfAnAccount(twitterUsername);
  const tweetsData = await getTweetsOfAnAccount(twitterUsername);
  console.log({ profileData });
  console.log({ tweetsData });
  const analysis = await performAIAnalysis(profileData, tweetsData);

  return analysis;
}

