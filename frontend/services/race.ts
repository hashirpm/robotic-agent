import axios from "axios";

const GRAPH_NETWORK_QUERY_URL =
  "https://api.studio.thegraph.com/query/62284/robot-race/version/latest";

export async function getUpcomingRaceData() {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Get current Unix timestamp

  let query = `
        query {
            races(
                where: { 
                    isCompleted: false, 
                    raceTime_gt: ${currentTimestamp} 
                },
                orderBy: raceTime,
                first: 100
            ) {
                id
                isActive
                raceTime
                stakingEndTime
                totalPrizePool

                robot1 {
                    id
                    basename
                    twitter
                    tokenName
                    tokenAddress
                    level
                    totalStake
                    minimumStake
                    stakers {
                        id
                        totalStaked
                    }
                }

                robot2 {
                    id
                    basename
                    twitter
                    tokenName
                    tokenAddress
                    level
                    totalStake
                    minimumStake
                    stakers {
                        id
                        totalStaked
                    }
                }

                stakes {
                    staker {
                        id
                    }
                    robot {
                        id
                    }
                    amount
                    timestamp
                }

                traps {
                    buyer
                    amount
                    timestamp
                }
            }
        }
    `;

  let apiResponse = await axios.post(GRAPH_NETWORK_QUERY_URL, { query });
  console.log("Data from the graph");
  console.log(apiResponse.data.data.races);
  return apiResponse.data.data.races;
}
export async function getLiveRaceData() {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Get current Unix timestamp

  let query = `
        query {
            races(
                where: { 
                    isCompleted: false, 
                    isActive: true,
                    raceTime_gt: ${currentTimestamp} 
                },
                orderBy: raceTime,
                first: 1
            ) {
                id
                isActive
                raceTime
                stakingEndTime
                totalPrizePool

                robot1 {
                    id
                    basename
                    twitter
                    tokenName
                    tokenAddress
                    level
                    totalStake
                    minimumStake
                    stakers {
                        id
                        totalStaked
                    }
                }

                robot2 {
                    id
                    basename
                    twitter
                    tokenName
                    tokenAddress
                    level
                    totalStake
                    minimumStake
                    stakers {
                        id
                        totalStaked
                    }
                }

                stakes {
                    staker {
                        id
                    }
                    robot {
                        id
                    }
                    amount
                    timestamp
                }

                traps {
                    buyer
                    amount
                    timestamp
                }
            }
        }
    `;

  let apiResponse = await axios.post(GRAPH_NETWORK_QUERY_URL, { query });
  console.log("Data from the graph");
  console.log(apiResponse.data.data.races[0]);
  return apiResponse.data.data.races[0];
}
