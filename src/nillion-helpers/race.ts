import * as dotenv from "dotenv";

dotenv.config();

export const updateRaceLog = async (
  raceId: string,
  robot1Id: string,
  robot2Id: string,
  robot1Energy: number,
  robot2Energy: number,
  robot1Position: number,
  robot2Position: number,
  robot1Speed: number,
  robot2Speed: number
) => {
  try {
    const response = await fetch(
      `${process.env.NILLION_API_BASE_URL}/raceLog`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          secretKey: process.env.NILLION_ORG_SECRET,
          orgDid: process.env.NILLION_ORG_DID,
        },
        body: JSON.stringify({
          raceId: raceId,
          robot1Id: robot1Id,
          robot2Id: robot2Id,
          robot1Energy: robot1Energy,
          robot2Energy: robot2Energy,
          robot1Position: robot1Position,
          robot2Position: robot2Position,
          robot1Speed: robot1Speed,
          robot2Speed: robot2Speed,
        }),
      }
    );

    const data = await response.json();
    console.log("Updated Robot Stats:", data);
  } catch (error) {
    console.error("Error updating robot stats:", error);
  }
};
export async function getRobotData(robotId: string) {
  const response = await fetch(
    `${process.env.NILLION_API_BASE_URL}/getDataOfARobot`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secretKey: process.env.NILLION_ORG_SECRET,
        orgDid: process.env.NILLION_ORG_DID,
      },
      body: JSON.stringify({
        robotId: robotId,
      }),
    }
  );

  return response.json();
}
export async function getRaceLog(raceId: string) {
  const response = await fetch(
    `${process.env.NILLION_API_BASE_URL}/getLatestRaceLog`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secretKey: process.env.NILLION_ORG_SECRET,
        orgDid: process.env.NILLION_ORG_DID,
      },
      body: JSON.stringify({
        raceId: raceId,
      }),
    }
  );

  return response.json();
}
