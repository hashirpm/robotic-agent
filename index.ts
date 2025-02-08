import * as dotenv from "dotenv";
import {
  fetchNewRaces,
  fetchNewStakes,
  fetchNewTraps,
} from "./src/schedular/events";
import {
  initializeAgent,
  registerWalletBasename,
  scanForRaceOpportunities,
  validateEnvironment,
} from "./src/agent-kit/robo-agent";
import { generateRaceCreationTweet, generateStakingStartTweet } from "./src/tweet/race-tweets";
import { createTweetAPI, getProfileOfAnAccount } from "./src/scrapers/twitter";

dotenv.config();

const INTERVAL = 5000; // 5 seconds in milliseconds

async function main() {
  console.log("Starting Agent...");
  //   validateEnvironment();
  //   const { agent, config } = await initializeAgent();
  //   await registerWalletBasename(agent, config);
  //   setInterval(async () => {
  //     await scanForRaceOpportunities(agent, config);
  //   }, INTERVAL);
  //   setInterval(async () => {
  //     await fetchNewTraps();
  //   }, INTERVAL);
  //   setInterval(async () => {
  //     await fetchNewStakes();
  //   }, INTERVAL);
  //   setInterval(async () => {
  //     await fetchNewRaces();
  //   }, INTERVAL);
  const tweetContent = await generateStakingStartTweet(
    "aixbt_agent",
    "0xzerebro",
    "2025-02-08"
  );
  console.log(tweetContent);

  await createTweetAPI(tweetContent);

  console.log("Scheduled tasks are running every 5 seconds.");
}

// Run the main function
main().catch((error) => {
  console.error("Error in main function:", error);
});
