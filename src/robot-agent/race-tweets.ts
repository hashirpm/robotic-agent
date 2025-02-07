import { ChatOpenAI } from "@langchain/openai";
import { Profile } from "agent-twitter-client";
import {
  getProfileOfAnAccount,
  getTweetsOfAnAccount,
} from "../../twitter-scraper";

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

/**
 * Generate a tweet when a race is created
 */
export async function generateRaceCreationTweet(
  agent1: string,
  agent2: string,
  raceDate: string
) {
  const prompt = `Draft a tweet announcing a race between two AI agents. The tweet should be engaging, mention both agents, and include the race date.

  Agents:
  - ${agent1}
  - ${agent2}

  Race Date: ${raceDate}

  Example Tweet:
  "🚀 Exciting news! A thrilling race is set between ${agent1} and ${agent2} on ${raceDate}. Who will dominate the track? Stay tuned! #AIRace #AutonomousAgents"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

/**
 * Generate a tweet about both participants
 */
export async function generateParticipantTweet(agent1: string, agent2: string) {
  const profile1 = await getProfileOfAnAccount(agent1);
  const profile2 = await getProfileOfAnAccount(agent2);
  const tweets1 = await getTweetsOfAnAccount(agent1);
  const tweets2 = await getTweetsOfAnAccount(agent2);

  const prompt = `Draft a tweet introducing two AI agents who will compete in a race. Analyze their Twitter profiles and tweets to understand their style and create a tweet that reflects their personalities.

  Agent 1:
  - Profile: ${profile1}
  - Tweets: ${tweets1}

  Agent 2:
  - Profile: ${profile2}
  - Tweets: ${tweets2}

  Example Tweet:
  "Meet our competitors! ${agent1} is known for its lightning-fast algorithms, while ${agent2} brings unparalleled precision. Who will win? Let the race begin! #AIRace #AutonomousAgents"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

/**
 * Generate a tweet when staking starts
 */
export async function generateStakingStartTweet() {
  const prompt = `Draft a tweet announcing that staking has started for the upcoming race. The tweet should encourage participation and explain the benefits of staking. ROBO is the token that is to be staked.

  Example Tweet:
  "🎉 Staking is now LIVE for the next AI race! Stake your ROBO tokens to support your favorite agent and earn rewards. Don't miss out! #AIRace #Staking"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

/**
 * Generate a tweet when staking ends
 */
export async function generateStakingEndTweet() {
  const prompt = `Draft a tweet announcing that staking has ended for the upcoming race. The tweet should thank participants and build excitement for the race. 

  Example Tweet:
  "⏰ Staking for the AI race has officially ended! Thank you to everyone who participated. The race is about to begin—stay tuned for the results! #AIRace #AutonomousAgents"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

/**
 * Generate a reminder tweet for the match date
 */
export async function generateMatchReminderTweet(raceDate: string) {
  const prompt = `Draft a reminder tweet for the upcoming AI race. Include the race date and build excitement.

  Race Date: ${raceDate}

  Example Tweet:
  "⏳ Just 24 hours until the AI race! Don't forget to tune in on ${raceDate} to see which agent takes the crown. #AIRace #AutonomousAgents"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

/**
 * Generate a tweet when the match starts
 */
export async function generateMatchStartTweet(agent1: string, agent2: string) {
  const prompt = `Draft a tweet announcing that the race between two AI agents has started. Mention both agents and encourage viewers to follow the action.

  Agents:
  - ${agent1}
  - ${agent2}

  Example Tweet:
  "🏁 The race between ${agent1} and ${agent2} has officially started! Follow the action live and see who emerges victorious. #AIRace #AutonomousAgents"

  Generate a tweet in a similar style:`;

  const response = await llm.invoke(prompt);
  return response.content.toString();
}

