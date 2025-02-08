import { ChatOpenAI } from "@langchain/openai";
import { Profile } from "agent-twitter-client";
import {
  getProfileOfAnAccount,
  getTweetsOfAnAccount,
} from "../scrapers/twitter";
import * as dotenv from 'dotenv';
dotenv.config();
// Initialize LLM for tweet generation
const llm = new ChatOpenAI({
  model: "meta-llama/Llama-3.3-70B-Instruct",
  apiKey: process.env.HYPERBOLIC_API_KEY,
  configuration: {
    baseURL: "https://api.hyperbolic.xyz/v1",
  },
  maxTokens: 512,
  temperature: 0.7, // Higher temperature for creative tweet generation
  topP: 0.9,
});
export async function generateRaceCreationTweet(
  agent1: string,
  agent2: string,
  raceDate: string
) {
  
  const prompt = `Draft a tweet announcing a race between two AI agents. The tweet should be engaging, mention both agents, and include the race date.

  Agents:
  - ${agent1}
  - ${agent2}

  Race Date: ${raceDate} - Convert UNIX timestamp to a human-readable date

Output should just contain the tweet content only. Strictly follow the format of the example Output.
Example Output:
  "🚀 Exciting news! A thrilling race is set between ${agent1} and ${agent2} on ${raceDate}. Who will dominate the track? Stay tuned! #AIRace #AutonomousAgents"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  console.log(response.content.toString());
  return response.content.toString();
}
export async function generateStakingStartTweet(
  agent1: string,
  agent2: string,
  stakingEndTime: string // Accepting UNIX timestamp in seconds
) {

  const prompt = `Draft a tweet announcing that staking has started for an AI race. The tweet should encourage participation and highlight the agents.

  Agents:
  - ${agent1}
  - ${agent2}

  Staking ends at: ${stakingEndTime} -- Convert UNIX timestamp to a human-readable date

  Output should just contain the tweet content only. Strictly follow the format of the example Output.
  Example Output:
  "🔥 Staking is LIVE! Back your favorite AI racer! Will ${agent1} or ${agent2} take the crown? Stake now before 12 June 2024, 12 PM UTC! #AIRace #Staking"`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}


/**
 * Generate a tweet when staking ends, including the total prize pool
 */
export async function generateStakingEndTweet(
  agent1: string,
  agent2: string,
  totalPrizePool: number
) {
  const prompt = `Draft a tweet announcing that staking has ended for the AI race. The tweet should thank participants and mention the total prize pool.
  
  Agents:
  - ${agent1}
  - ${agent2}

  Prize Pool: ${totalPrizePool} ROBO tokens

Output should just contain the tweet content only. Strictly follow the format of the example Output.
Example Output:
  "⏳ Staking for the match between ${agent1} and ${agent2} has officially closed! A massive ${totalPrizePool} ROBO is up for grabs. The race is about to begin—who will win? #AIRace #AutonomousAgents"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

/**
 * Generate a reminder tweet 1 hour before the race
 */
export async function generateMatchReminderTweet(
  agent1: string,
  agent2: string,
  raceTime: any
) {
  const prompt = `Draft a reminder tweet for the upcoming AI race. Mention the competing agents and the race time.

  Agents:
  - ${agent1}
  - ${agent2}

  Race Time: ${raceTime} (convert UNIX timestamp to a readable date)

Output should just contain the tweet content only. Strictly follow the format of the example Output.
Example Output:
  "🚨 1 HOUR TO GO! The showdown between ${agent1} and ${agent2} is almost here. Who's your pick? Get ready for an epic race at ${raceTime}! #AIRace #Countdown"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

/**
 * Generate a tweet when the match starts
 */
export async function generateMatchStartTweet(agent1: string, agent2: string) {
  const prompt = `Draft a tweet announcing that the race has started. Mention both competitors and encourage engagement.

  Agents:
  - ${agent1}
  - ${agent2}

Output should just contain the tweet content only. Strictly follow the format of the example Output.
Example Output:
  "🏁 IT'S RACE TIME! ${agent1} and ${agent2} are off to a thrilling start. Stay tuned for the action! Who will cross the finish line first? #AIRace #LiveRace"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}
