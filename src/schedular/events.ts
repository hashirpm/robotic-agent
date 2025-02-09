import axios from "axios";
import {
  generateMatchReminderTweet,
  generateRaceCreationTweet,
  generateRaceEndTweet,
  generateRaceProgressTweet,
  generateRaceStartTweet,
  generateStakingEndTweet,
  generateStakingStartTweet,
} from "../tweet/race-tweets";
import { scheduleTweet } from "./helper";
import { createTweetAPI } from "../scrapers/twitter";
import {
  getRaceLog,
  getRobotData,
  updateRaceLog,
} from "../nillion-helpers/race";
import { generateSpeedScore } from "../agent-kit/speed-score";
import { updateWinner } from "../agent-kit/robo-agent";
import { createNewTask } from "../eigenlayer-avs/operator/createNewTasks";
import { roboticAgentServiceManager } from "../eigenlayer-avs/operator";

const GRAPH_NETWORK_QUERY_URL = process.env.GRAPH_NETWORK_QUERY_URL!;

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
          `${process.env.NILLION_API_URL}/addRobotTrap`,
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
          twitter
        }
          robot2 {  
          id
          basename 
          twitter
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

        // Post race creation tweet immediately
        const tweet = await generateRaceCreationTweet(
          robot1.twitter,
          robot2.twitter,
          raceStartDate.toISOString()
        );
        await createTweetAPI(tweet);

        // Schedule staking start tweet
        scheduleTweet(stakingEndDate, -2 * 60 * 60 * 1000, async () => {
          const tweet = await generateStakingStartTweet(
            robot1.twitter,
            robot2.twitter,
            stakingEndDate.toISOString()
          );
          await createTweetAPI(tweet);
        });

        // Schedule staking end tweet with total prize pool
        scheduleTweet(stakingEndDate, 0, async () => {
          const tweet = await generateStakingEndTweet(
            robot1.twitter,
            robot2.twitter,
            totalPrizePool
          );
          await createTweetAPI(tweet);
          const robot1Data = await getRobotData(robot1.basename);
          const robot2Data = await getRobotData(robot2.basename);
          const robot1BaseSpeed = robot1Data.data.baseSpeed;
          const robot1Abilities = robot1Data.data.hiddenAbilities;
          const robot2BaseSpeed = robot2Data.data.baseSpeed;
          const robot2Abilities = robot2Data.data.hiddenAbilities;
          //Call AVS for offchain speed score computation
          let offChainAVSScoreRobot1 = -1;
          let offChainAVSScoreRobot2 = -1;
          await createNewTask(robot1.twitter);
          await createNewTask(robot2.twitter);
          while (offChainAVSScoreRobot1 == -1 || offChainAVSScoreRobot2 == -1) {
            roboticAgentServiceManager.on(
              "TaskResponded",
              async (
                taskIndex: number,
                task: any,
                score: number,
                operator: string
              ) => {
                console.log(
                  `Task responded: Username - ${task.username}, Score - ${score}, Operator - ${operator}`
                );
                if (task.username == robot1.twitter) {
                  offChainAVSScoreRobot1 = score;
                } else if (task.username == robot2.twitter) {
                  offChainAVSScoreRobot2 = score;
                }
              }
            );
          }

          await updateRaceLog(
            race.id,
            robot1.basename,
            robot2.basename,
            100,
            100,
            0,
            0,
            Number(robot1BaseSpeed) + Number(offChainAVSScoreRobot1),
            Number(robot2BaseSpeed) + Number(offChainAVSScoreRobot2)
          );
        });

        // Schedule race reminder tweet (1 hour before race start)
        scheduleTweet(raceStartDate, -1 * 60 * 60 * 1000, async () => {
          const tweet = await generateMatchReminderTweet(
            robot1.basename,
            robot2.basename,
            raceStartDate.toISOString()
          );
          await createTweetAPI(tweet);
        });

        // Schedule race start tweet
        scheduleTweet(raceStartDate, 0, async () => {
          //Generate a random number between 0 and 80
          const tweetEnergy = Math.floor(Math.random() * 80);
          let isTweeted = false;
          const tweet = await generateRaceStartTweet(
            robot1.twitter,
            robot2.twitter,
            race.totalPrizePool
          );
          await createTweetAPI(tweet);

          let raceLog: any;
          raceLog = await getRaceLog(race.id);
          while (
            raceLog.data.sensitiveData.robot1Energy != 0 &&
            raceLog.data.sensitiveData.robot2Energy != 0
          ) {
            //Call AVS
            let offChainAVSScoreRobot1 = -1;
            let offChainAVSScoreRobot2 = -1;
            await createNewTask(robot1.twitter);
            await createNewTask(robot2.twitter);
            while (
              offChainAVSScoreRobot1 == -1 ||
              offChainAVSScoreRobot2 == -1
            ) {
              roboticAgentServiceManager.on(
                "TaskResponded",
                async (
                  taskIndex: number,
                  task: any,
                  score: number,
                  operator: string
                ) => {
                  console.log(
                    `Task responded: Username - ${task.username}, Score - ${score}, Operator - ${operator}`
                  );
                  if (task.username == robot1.twitter) {
                    offChainAVSScoreRobot1 = score;
                  } else if (task.username == robot2.twitter) {
                    offChainAVSScoreRobot2 = score;
                  }
                }
              );
            }

            const robot1UpdatedEnergy = Math.max(
              0,
              Math.min(100, Number(raceLog.data.sensitiveData.robot1Energy), -1)
            );
            const robot1UpdatedPosition = Math.max(
              0,
              Math.min(
                100,
                Number(raceLog.data.sensitiveData.robot1Position),
                +(Number(raceLog.data.sensitiveData.robot1Speed) / 100) * 0.5
              )
            );
            const robot2UpdatedEnergy = Math.max(
              0,
              Math.min(100, Number(raceLog.data.sensitiveData.robot2Energy), -1)
            );
            const robot2UpdatedPosition = Math.max(
              0,
              Math.min(
                100,
                Number(raceLog.data.sensitiveData.robot2Position),
                +(Number(raceLog.data.sensitiveData.robot2Speed) / 100) * 0.5
              )
            );
            await updateRaceLog(
              race.id,
              raceLog.data.publicData.robot1Id,
              raceLog.data.publicData.robot2Id,
              robot1UpdatedEnergy,
              robot2UpdatedEnergy,
              robot1UpdatedPosition,
              robot2UpdatedPosition,
              Number(raceLog.data.sensitiveData.robot1Speed) +
                Number(offChainAVSScoreRobot1),
              Number(raceLog.data.sensitiveData.robot2Speed) +
                Number(offChainAVSScoreRobot2)
            );
            if (
              raceLog.data.sensitiveData.robot1Energy < tweetEnergy &&
              !isTweeted
            ) {
              const tweet = await generateRaceProgressTweet(
                robot1.twitter,
                robot2.twitter,
                raceLog.data.sensitiveData.robot1Position,
                raceLog.data.sensitiveData.robot2Position,
                raceLog.data.sensitiveData.robot1Speed,
                raceLog.data.sensitiveData.robot2Speed,
                raceLog.data.sensitiveData.robot1Energy,
                raceLog.data.sensitiveData.robot2Energy
              );
              await createTweetAPI(tweet);
            }
            raceLog = await getRaceLog(race.id);
          }

          if (
            raceLog.data.sensitiveData.robot1Energy == 0 &&
            raceLog.data.sensitiveData.robot2Energy == 0
          ) {
            const winner =
              raceLog.data.sensitiveData.robot1Position >
              raceLog.data.sensitiveData.robot2Position
                ? robot1.twitter
                : robot2.twitter;
            const tweet = await generateRaceEndTweet(
              robot1.twitter,
              robot2.twitter,
              winner,
              race.totalPrizePool
            );
            await createTweetAPI(tweet);
            //Call complete race function in smartcontract
            await updateWinner(race.id, winner);
          }
        });
      }
    }
  } catch (error) {
    console.error("Error fetching new races:", error);
  }
}
