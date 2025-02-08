"use client";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Bot,
  Trophy,
  Wallet as WalletIcon,
  Twitter,
  Coins,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUpcomingRaceData } from "@/services/race";
import { WalletComponents } from "@/components/ui/wallet";
import { useAccount, useWriteContract } from "wagmi";
import { RaceManagerABI } from "@/abis/RaceManager";
import { wagmiConfig } from "@/providers/WagmiProviderWrapper";
import { writeContract } from "@wagmi/core";
export interface RobotData {
  id: string;
  basename: string;
  twitter: string;
  tokenName: string;
  tokenAddress: string;
  level: number;
  totalStake: number;
  minimumStake: number;
}

export interface Race {
  id?: string;
  robot1: RobotData;
  robot2: RobotData;
  isActive: boolean;
  isCompleted: boolean;
  winner: string;
  totalPrizePool: number;
  raceTime: number;
  stakingEndTime: number;
}

export default function RacesPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    const fetchData = async () => {
      const upcomingRaces = await getUpcomingRaceData();
      const formattedRaces = upcomingRaces.map((race: any) => ({
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
      }));
      setRaces(formattedRaces);
    };
    fetchData();
  }, []);

  const handleStake = (robot: string, amount: number) => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    console.log("Staking", robot, amount);
    console.log(process.env.NEXT_PUBLIC_RACEMANAGER_CONTRACT_ADDRESS);
    writeContract(wagmiConfig, {
      abi: RaceManagerABI,
      address: process.env
        .NEXT_PUBLIC_RACEMANAGER_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "addStake",
      args: [robot, amount],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Upcoming Races</h1>
        <WalletComponents />
        <div className="grid grid-cols-1 gap-6">
          {races.map((race, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="text-primary" />
                  <span className="font-semibold">Race #{index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <WalletIcon className="text-chart-1" />
                  <span className="font-bold">{race.totalPrizePool} ROBO</span>
                </div>
              </div>

              {/* Robot Details */}
              <div className="grid grid-cols-2 gap-4">
                {[race.robot1, race.robot2].map((robot, i) => (
                  <div key={i} className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="text-primary" />
                      <span className="text-lg font-bold">
                        {robot.basename}
                      </span>
                    </div>
                    <div className="text-sm space-y-2">
                      <p className="flex items-center gap-1">
                        <Twitter className="w-4 h-4 text-blue-500" />
                        <span>
                          {robot.twitter ? (
                            <a
                              href={`https://twitter.com/${robot.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              @{robot.twitter}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>Level: {robot.level}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-green-500" />
                        <span>Stake Amount: {robot.minimumStake} ROBO</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <WalletIcon className="w-4 h-4 text-purple-500" />
                        <span>Total Staked: {robot.totalStake} ROBO</span>
                      </p>
                    </div>
                    <button
                      className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity"
                      onClick={() => handleStake(robot.id, robot.minimumStake)}
                    >
                      Place Stake on ${robot.tokenName}
                    </button>
                  </div>
                ))}
              </div>

              {/* Race Timing */}
              <div className="flex justify-between text-sm mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(race.raceTime, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Staking ends:{" "}
                    {formatDistanceToNow(race.stakingEndTime, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
