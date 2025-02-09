"use client";

import { useState, useEffect } from "react";
import { Battery, Bot, Gauge, Shield, Zap } from "lucide-react";
import { WalletComponents } from "@/components/ui/wallet";
import { useAccount } from "wagmi";
import { RaceManagerABI } from "@/abis/RaceManager";
import { writeContract } from "@wagmi/core";
import { wagmiConfig } from "@/providers/WagmiProviderWrapper";
import { getLiveRaceData } from "@/services/race";
import { Race } from "../races/page";
import { forma } from "wagmi/chains";
import { useRouter } from "next/navigation";

interface RobotStats {
  speed: number;
  energy: number;
  trapsDeployed: number;
  position: number;
}

interface TrapType {
  id: number;
  name: string;
  cost: number;
  effect: string;
  drain: number;
}

export default function LiveRacePage() {
  const router = useRouter();
  const { address } = useAccount();
  const [races, setRaces] = useState<Race>();
  const [robot1Stats, setRobot1Stats] = useState<RobotStats>({
    speed: 0,
    energy: 0,
    trapsDeployed: 0,
    position: 0,
  });

  const [robot2Stats, setRobot2Stats] = useState<RobotStats>({
    speed: 0,
    energy: 0,
    trapsDeployed: 0,
    position: 0,
  });

  const [selectedRobot, setSelectedRobot] = useState<string>("");
  const [selectedTrap, setSelectedTrap] = useState<number | null>(null);

  const traps: TrapType[] = [
    {
      id: 0,
      name: "Basic Trap",
      cost: 1000,
      effect: "Drains 5% energy",
      drain: 5,
    },
    {
      id: 1,
      name: "Medium Trap",
      cost: 2000,
      effect: "Drains 20% energy",
      drain: 20,
    },
    {
      id: 2,
      name: "Energy Drain",
      cost: 3000,
      effect: "Drains 30% energy",
      drain: 30,
    },
  ];

  const updateRobotStats = async () => {
    if (!races) return;
    if (robot1Stats.energy <= 0 && robot2Stats.energy <= 0) return;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (process.env.NEXT_PUBLIC_NILLION_ORG_SECRET) {
        headers["secretKey"] = process.env.NEXT_PUBLIC_NILLION_ORG_SECRET;
      }

      if (process.env.NEXT_PUBLIC_NILLION_ORG_DID) {
        headers["orgDid"] = process.env.NEXT_PUBLIC_NILLION_ORG_DID;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NILLION_API_BASE_URL}/getLatestRaceLog`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            raceId: races.id,
          }),
        }
      );

      const data = await response.json();
      console.log(data.data);
      if (data.success) {
        setRobot1Stats((prev) => ({
          ...prev,
          speed: data.data.robot1.speed,
          energy: data.data.robot1.energy,
          position: data.data.robot1.position,
        }));

        setRobot2Stats((prev) => ({
          ...prev,
          speed: data.data.robot2.speed,
          energy: data.data.robot2.energy,
          position: data.data.robot2.position,
        }));
      }
    } catch (error) {
      console.error("Error updating robot stats:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const race = await getLiveRaceData();
      if (race === null) {
        router.push("/no-race");
      }
      const formattedRace = {
        id: race.id,
        robot1: {
          id: race.robot1?.id || "0x0000...0000",
          basename: race.robot1?.basename || "Unknown",
          twitter: race.robot1?.twitter || "",
          tokenName: race.robot1?.tokenName || "N/A",
          tokenAddress: race.robot1?.tokenAddress || "0x0000...0000",
          level: race.robot1?.level || 0,
          totalStake: race.robot1?.totalStake || 0,
          minimumStake: race.robot1?.minimumStake || 0,
        },
        robot2: {
          id: race.robot2?.id || "0x0000...0000",
          basename: race.robot2?.basename || "Unknown",
          twitter: race.robot2?.twitter || "",
          tokenName: race.robot2?.tokenName || "N/A",
          tokenAddress: race.robot2?.tokenAddress || "0x0000...0000",
          level: race.robot2?.level || 0,
          totalStake: race.robot2?.totalStake || 0,
          minimumStake: race.robot2?.minimumStake || 0,
        },

        isActive: race.isActive,
        isCompleted: false,
        winner: "0x0000...0000",
        totalPrizePool: Number(race.totalPrizePool) || 0,
        raceTime: Number(race.raceTime) * 1000,
        stakingEndTime: Number(race.stakingEndTime) * 1000,
      };
      setRaces(formattedRace);
    };
    const fetchStats = async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (process.env.NEXT_PUBLIC_NILLION_ORG_SECRET) {
        headers["secretKey"] = process.env.NEXT_PUBLIC_NILLION_ORG_SECRET;
      }

      if (process.env.NEXT_PUBLIC_NILLION_ORG_DID) {
        headers["orgDid"] = process.env.NEXT_PUBLIC_NILLION_ORG_DID;
      }
      // Fetch robot initial stats from the nillion
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NILLION_API_BASE_URL}/getLatestRaceLog`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            raceId: races?.id,
          }),
        }
      );

      const data = await response.json();
      console.log("Initial Stats", data);
      if (data.success) {
        setRobot1Stats({
          speed: data.data.robot1.speed,
          energy: data.data.robot1.energy,
          position: data.data.robot1.position,
          trapsDeployed: data.data.robot1.trapsDeployed || 0,
        });
        setRobot2Stats({
          speed: data.data.robot2.speed,
          energy: data.data.robot2.energy,
          position: data.data.robot2.position,
          trapsDeployed: data.data.robot2.trapsDeployed || 0,
        });
      }
    };
    fetchData();
    fetchStats();
  }, []);
  // Update stats using API every second
  useEffect(() => {
    const interval = setInterval(updateRobotStats, 1000);
    return () => clearInterval(interval);
  }, [races, robot1Stats, robot2Stats]);

  const handleBuyTrap = (raceId: number, amount: number, robot: string) => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    console.log(raceId, amount, robot);
    writeContract(wagmiConfig, {
      abi: RaceManagerABI,
      address: process.env
        .NEXT_PUBLIC_RACEMANAGER_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "buyTrap",
      args: [raceId, robot, amount],
    });
  };
  return (
    <>
      <WalletComponents />
      <div className="min-h-screen bg-gradient-to-b from-background to-accent p-8">
        <div className="container mx-auto">
          <div className="grid ">
            {/* Race Track Visualization */}

            <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-lg mb-10">
              <h2 className="text-2xl font-bold mb-6">Live Race Track</h2>
              <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
                <div
                  className="absolute top-1/4 h-12 w-12 bg-chart-1 rounded-full transition-all duration-500"
                  style={{ left: `${robot1Stats.position}%` }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    🤖1
                  </span>
                </div>
                <div
                  className="absolute top-2/4 h-12 w-12 bg-chart-2 rounded-full transition-all duration-500"
                  style={{ left: `${robot2Stats.position}%` }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    🤖2
                  </span>
                </div>
              </div>

              {/* Stats Display */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  {
                    stats: robot1Stats,
                    name: races?.robot1.basename,
                    color: "chart-1",
                  },
                  {
                    stats: robot2Stats,
                    name: races?.robot2.basename,
                    color: "chart-2",
                  },
                ].map((robot, index) => (
                  <div
                    key={index}
                    className={`bg-card p-4 rounded-lg border border-${robot.color}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="text-primary" />
                      <span className="text-lg font-bold">{robot.name}</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full">
                            <div
                              className={`h-full bg-${robot.color} rounded-full transition-all duration-300`}
                              style={{ width: `${robot.stats.speed}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            Speed: {robot.stats.speed.toFixed(1)} 
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full">
                            <div
                              className={`h-full bg-${robot.color} rounded-full transition-all duration-300`}
                              style={{ width: `${robot.stats.energy}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            Energy: {robot.stats.energy.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {/* <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm">
                          Traps Deployed: {robot.stats.trapsDeployed}
                        </span>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trap Selection */}
            <div className="bg-card rounded-xl p-6 shadow-lg pt-10">
              <h2 className="text-2xl font-bold mb-6">Deploy Traps</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Robot
                  </label>
                  <select
                    className="w-full p-2 rounded-lg bg-muted"
                    value={selectedRobot}
                    onChange={(e) => setSelectedRobot(e.target.value)}
                  >
                    <option value="">Choose a robot</option>
                    {races && (
                      <>
                        <option value={races.robot1.id}>
                          {races.robot1.basename}
                        </option>
                        <option value={races.robot2.id}>
                          {races.robot2.basename}
                        </option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">
                    Available Traps
                  </label>
                  {traps.map((trap) => (
                    <div
                      key={trap.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTrap === trap.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() => setSelectedTrap(trap.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{trap.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {trap.effect}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          <span>{trap.cost} ROBO</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={selectedTrap === null}
                  onClick={() => {
                    console.log("Selected Trap");

                    console.log(traps[selectedTrap!].cost);
                    console.log(selectedTrap);
                    if (races) {
                      handleBuyTrap(
                        Number(races.id),
                        traps[selectedTrap!].cost,
                        selectedRobot
                      );
                    }
                  }}
                >
                  Deploy Trap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
