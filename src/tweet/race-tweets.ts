import { ChatOpenAI } from "@langchain/openai";
import { Profile } from "agent-twitter-client";
import {
  getProfileOfAnAccount,
  getTweetsOfAnAccount,
} from "../scrapers/twitter";
import * as dotenv from "dotenv";
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
  🚀 Exciting news! A thrilling race is set between @${agent1} and @${agent2} on ${raceDate}. Who will dominate the track? Stay tuned!

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
  🔥 Staking is LIVE! Back your favorite AI racer! Will @${agent1} or @${agent2} take the crown? Stake now before 12 June 2024, 12 PM UTC!`;

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
  ⏳ Staking for the match between @${agent1} and @${agent2} has officially closed! A massive ${totalPrizePool} ROBO is up for grabs. The race is about to begin—who will win?

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
  🚨 1 HOUR TO GO! The showdown between @${agent1} and @${agent2} is almost here. Who's your pick? Get ready for an epic race at ${raceTime}!

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

export async function generateRaceProgressTweet(
  raceId: string,
  agent1: string,
  agent2: string,
  agent1Position: number,
  agent2Position: number,
  agent1Speed: number,
  agent2Speed: number,
  agent1Energy: number,
  agent2Energy: number
) {
  // Determine who's leading
  const leader = agent1Position > agent2Position ? agent1 : agent2;
  const leadDistance = Math.abs(agent1Position - agent2Position);

  const prompt = `Draft an exciting tweet about the current race progress. Include race stats and who's leading.

  Race ID: ${raceId}
  Agents:
  - ${agent1} (Position: ${agent1Position}, Speed: ${agent1Speed}, Energy: ${agent1Energy}%)
  - ${agent2} (Position: ${agent2Position}, Speed: ${agent2Speed}, Energy: ${agent2Energy}%)
  Leader: ${leader}
  Lead Distance: ${leadDistance}

Output should just contain the tweet content only. Strictly follow the format of the example Output.
Example Output:
  🏃‍♂️ Race #${raceId} Update: @${leader} is in the lead! 
  
  @${agent1}: ${agent1Energy}% energy, ${agent1Speed}km/h
  @${agent2}: ${agent2Energy}% energy, ${agent2Speed}km/h
  
  The chase is intense! 🔥

Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

export async function generateRaceEndTweet(
  raceId: string,
  agent1: string,
  agent2: string,
  winner: string,
  totalPrizePool: number
) {
  const prompt = `Draft a tweet announcing the race winner and thanking participants.

  Race ID: ${raceId}
  Winner: ${winner}
  Runner-up: ${winner === agent1 ? agent2 : agent1}
  Prize Pool: ${totalPrizePool} ROBO tokens

Output should just contain the tweet content only. Strictly follow the format of the example Output.
Example Output:
  🏆 RACE #${raceId} COMPLETE! Congratulations @${winner} on your victory! 
  
  Amazing performance by both @${agent1} and @${agent2}!
  
  ${totalPrizePool} ROBO rewards will be distributed to winning stakers shortly. Thank you all for participating! 🎉

Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

export async function generateRaceStartTweet(
  agent1: string,
  agent2: string,
  totalPrizePool: number
) {
  const prompt = `Draft an exciting tweet announcing that the race has officially started. Include race details and participation stats.

  Agents:
  - ${agent1}
  - ${agent2}
  Prize Pool: ${totalPrizePool} ROBO tokens

Output should just contain the tweet content only. Strictly follow the format of the example Output.
Example Output:
  🚦 RACE @${agent1} vs @${agent2} IS LIVE! 
  
  💰 Prize Pool: ${totalPrizePool} ROBO
  
  May the best agent win! 🤖

Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}
