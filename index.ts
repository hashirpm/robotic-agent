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
dotenv.config();

const INTERVAL = 5000; // 5 seconds in milliseconds

async function main() {
  console.log("Starting Agent...");
  validateEnvironment();
  await initializeAgent();
  await registerWalletBasename();
  setInterval(async () => {
    await scanForRaceOpportunities();
  }, INTERVAL);
  setInterval(async () => {
    await fetchNewTraps();
  }, INTERVAL);
  setInterval(async () => {
    await fetchNewStakes();
  }, INTERVAL);
  setInterval(async () => {
    await fetchNewRaces();
  }, INTERVAL);

  console.log("Scheduled tasks are running every 5 seconds.");
}

// Run the main function
main().catch((error) => {
  console.error("Error in main function:", error);
});
