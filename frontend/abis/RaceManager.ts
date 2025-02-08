
export const RaceManagerABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_roboToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newMinimumStake",
        type: "uint256",
      },
    ],
    name: "MinimumStakeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raceId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stakersReward",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "robotReward",
        type: "uint256",
      },
    ],
    name: "RaceCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raceId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "robot1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "robot2",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "raceTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stakingEndTime",
        type: "uint256",
      },
    ],
    name: "RaceCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minimumStake",
        type: "uint256",
      },
    ],
    name: "RobotRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "StakeAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountBurned",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "raceId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "robot",
        type: "address",
      },
    ],
    name: "TrapPurchased",
    type: "event",
  },
  {
    inputs: [],
    name: "ROBOT_SHARE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STAKERS_SHARE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STAKING_BUFFER_TIME",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "addStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "raceId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "buyTrap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "raceId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "winner",
        type: "address",
      },
    ],
    name: "completeRace",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "robot1",
        type: "address",
      },
      {
        internalType: "address",
        name: "robot2",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "raceTime",
        type: "uint256",
      },
    ],
    name: "createRace",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "robot",
        type: "address",
      },
    ],
    name: "findActiveRaceForRobot",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUpcomingRaces",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "robot1",
            type: "address",
          },
          {
            internalType: "address",
            name: "robot2",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isCompleted",
            type: "bool",
          },
          {
            internalType: "address",
            name: "winner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "totalPrizePool",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "raceTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stakingEndTime",
            type: "uint256",
          },
        ],
        internalType: "struct RobotRaceManager.Race[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "robot",
        type: "address",
      },
    ],
    name: "getRobotData",
    outputs: [
      {
        internalType: "uint256",
        name: "totalStake",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumStake",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "stakers",
        type: "address[]",
      },
      {
        internalType: "string",
        name: "basename",
        type: "string",
      },
      {
        internalType: "string",
        name: "twitter",
        type: "string",
      },
      {
        internalType: "string",
        name: "tokenName",
        type: "string",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "raceCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "races",
    outputs: [
      {
        internalType: "address",
        name: "robot1",
        type: "address",
      },
      {
        internalType: "address",
        name: "robot2",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isCompleted",
        type: "bool",
      },
      {
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "totalPrizePool",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "raceTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stakingEndTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minimumStake",
        type: "uint256",
      },
    ],
    name: "registerRobot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "registeredRobots",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "roboToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "robots",
    outputs: [
      {
        internalType: "uint256",
        name: "totalStake",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumStake",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "basename",
        type: "string",
      },
      {
        internalType: "string",
        name: "twitter",
        type: "string",
      },
      {
        internalType: "string",
        name: "tokenName",
        type: "string",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "newMinimumStake",
        type: "uint256",
      },
    ],
    name: "updateMinimumStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "robot",
        type: "address",
      },
      {
        internalType: "string",
        name: "basename",
        type: "string",
      },
      {
        internalType: "string",
        name: "twitter",
        type: "string",
      },
      {
        internalType: "string",
        name: "tokenName",
        type: "string",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    name: "updateRobotData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
