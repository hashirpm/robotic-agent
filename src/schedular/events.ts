import axios from "axios";
import {
  generateMatchReminderTweet,
  generateMatchStartTweet,
  generateRaceCreationTweet,
  generateStakingStartTweet,
} from "../robot-agent/race-tweets";

const GRAPH_NETWORK_QUERY_URL =
  "https://api.studio.thegraph.com/query/62284/robot-race/version/latest";

// Track the latest timestamps for traps, stakes, and races
let lastTrapTimestamp: BigInt = BigInt(0);
let lastStakeTimestamp: BigInt = BigInt(0);
let lastRaceTimestamp: BigInt = BigInt(0);

// Function to fetch new traps
export async function fetchNewTraps() {
  try {
    const query = `
      query {
        traps(
          where: { timestamp_gt: "${lastTrapTimestamp}" },
          orderBy: timestamp,
          orderDirection: asc,
          first: 100
        ) {
          id
          race {
            id
          }
          buyer
          amount
          timestamp
          robot {
            id
          }
        }
      }
    `;

    const apiResponse = await axios.post(GRAPH_NETWORK_QUERY_URL, { query });
    const traps = apiResponse.data.data.traps;

    if (traps.length > 0) {
      console.log("New Traps:", traps);
      lastTrapTimestamp = traps[traps.length - 1].timestamp; // Update the last timestamp
      for (const trap of traps) {
        const buyer_id = trap.buyer;
        const trap_amount = trap.amount;
        const race_id = trap.race.id;
        const robot_id = trap.robot.id;
        const response = await fetch(
          `${process.env.NILLION_API_URL}/addRobotStake`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              secretKey: process.env.NILLION_ORG_SECRET_KEY,
              orgDid: process.env.NILLION_ORG_DID,
            },
            body: JSON.stringify({
              buyer_id,
              trap_amount,
              race_id,
              robot_id,
            }),
          }
        );
      }
    }
  } catch (error) {
    console.error("Error fetching new traps:", error);
  }
}

// Function to fetch new stakes
export async function fetchNewStakes() {
  try {
    const query = `
      query {
        stakes(
          where: { raceTime_gt: "${lastStakeTimestamp}" },
          orderBy: raceTime,
          orderDirection: asc,
          first: 100
        ) {
          id
          race {
            id
          }
          staker {
            id
          }
          robot {
            id
          }
          amount
        }
      }
    `;

    const apiResponse = await axios.post(GRAPH_NETWORK_QUERY_URL, { query });
    const stakes = apiResponse.data.data.stakes;

    if (stakes.length > 0) {
      console.log("New Stakes:", stakes);
      lastStakeTimestamp = stakes[stakes.length - 1].timestamp; // Update the last timestamp
      // Update nillion secret vault
      for (const stake of stakes) {
        const staker_id = stake.staker.id;
        const staker_amount = stake.amount;
        const race_id = stake.race.id;
        const robot_id = stake.robot.id;
        const response = await fetch(
          `${process.env.NILLION_API_URL}/addRobotStake`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              secretKey: process.env.NILLION_ORG_SECRET_KEY,
              orgDid: process.env.NILLION_ORG_DID,
            },
            body: JSON.stringify({
              staker_id,
              staker_amount,
              race_id,
              robot_id,
            }),
          }
        );
      }
    }
  } catch (error) {
    console.error("Error fetching new stakes:", error);
  }
}

// Function to fetch new races
export async function fetchNewRaces() {
  try {
    const query = `
      query {
        races(
          where: { 
            raceTime_gt: ${lastRaceTimestamp}, 
            isCompleted: false, 
          },
          orderBy: raceTime,
          first: 100
        ) {
          id
          robot1 { 
          id
          basename
        }
          robot2 {  
          id
          basename 
          }
          totalPrizePool
          raceTime
          stakingEndTime
        }
      }
    `;

    const apiResponse = await axios.post(GRAPH_NETWORK_QUERY_URL, { query });
    const races = apiResponse.data.data.races;
    console.log(races);
    if (races.length > 0) {
      console.log("New Races:", races);
      lastRaceTimestamp = races[races.length - 1].timestamp; // Update last timestamp

      for (const race of races) {
        const { id, robot1, robot2, totalPrizePool, raceTime, stakingEndTime } =
          race;

        //     // Convert timestamps to Date objects
        const stakingEndDate = new Date(stakingEndTime * 1000);
        const raceStartDate = new Date(raceTime * 1000);

        console.log(
          `Scheduling tweets for race ${id} between ${robot1.id} and ${robot2.id}`
        );

        //     // Post race creation tweet immediately
        await generateRaceCreationTweet(
          robot1.basename,
          robot2.basename,
          raceStartDate.toISOString()
        );

        // Schedule staking start tweet
        scheduleTweet(stakingEndDate, -2 * 60 * 60 * 1000, async () => {
          await generateStakingStartTweet(
            robot1.basename,
            robot2.basename,
            stakingEndDate.toISOString()
          );
        });

        // Schedule staking end tweet with total prize pool
        scheduleTweet(stakingEndDate, 0, async () => {
          const tweet = `⏳ Staking has ended! The total prize pool is ${totalPrizePool} ROBO. The race is coming soon! #AIRace #AutonomousAgents`;
          console.log("Posting tweet:", tweet);
        });

        // Schedule race reminder tweet (1 hour before race start)
        scheduleTweet(raceStartDate, -1 * 60 * 60 * 1000, async () => {
          await generateMatchReminderTweet(
            robot1.basename,
            robot2.basename,
            raceStartDate.toISOString()
          );
        });

        // Schedule race start tweet
        scheduleTweet(raceStartDate, 0, async () => {
          await generateMatchStartTweet(robot1.basename, robot2.basename);
        });
      }
    }
  } catch (error) {
    console.error("Error fetching new races:", error);
  }
}
function scheduleTweet(
  eventDate: Date,
  offsetMs: number,
  tweetFunction: () => Promise<void>
) {
  const tweetTime = new Date(eventDate.getTime() + offsetMs);
  const timeUntilTweet = tweetTime.getTime() - Date.now();

  // Check if the delay is too large
  if (timeUntilTweet > 0) {
    if (timeUntilTweet > 2_147_483_647) {
      console.log(
        `Delay too large for setTimeout, breaking into smaller intervals.`
      );

      // Split into smaller chunks, e.g., 2-hour intervals
      const maxDelay = 2_147_483_647; // Max delay for setTimeout
      let remainingTime = timeUntilTweet;

      // Set intervals of maxDelay
      while (remainingTime > maxDelay) {
        setTimeout(async () => {
          await tweetFunction();
        }, maxDelay);
        remainingTime -= maxDelay;
      }

      // Set the final smaller delay
      setTimeout(async () => {
        await tweetFunction();
      }, remainingTime);
    } else {
      console.log(`Tweet scheduled at ${tweetTime.toISOString()}`);
      setTimeout(async () => {
        await tweetFunction();
      }, timeUntilTweet);
    }
  } else {
    console.log(
      `Skipped scheduling tweet, time already passed: ${tweetTime.toISOString()}`
    );
  }
}
