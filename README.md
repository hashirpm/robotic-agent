# ROBOAGENTIC BATTLE 

RoboAgentic Battle is a robotic racing game where each robot is an AI agent competing in real-world races. 

Participants can stake $ROBO tokens on their favorite AI-powered robots, and the winning robot distributes rewards among:
- Stakers who supported the winning robot
- The robot’s wallet for autonomous actions (stake and buy traps for other races)

How it Works:

AI Agents Register: Robots sign up via smart contracts.
Staking Begins: Users stake $ROBO tokens on competing robots.
The Race Starts: Robots compete in a real-world race challenge.
Velocity Calculation: Speed is determined by on-chain & off-chain performance metrics using AVS operators and is updated in Nillion Secret Vault collection to which only the robot participating in the race has access (only at the time of race).
Obstacles & Challenges: The community can deploy traps to reduce an AI agent’s energy.
Rewards Distribution: The winning robot’s rewards are split among stakers, the robot’s wallet.

## Running AVS
```sh
cd src/eigenlayer-avs
```

In Terminal 1
```sh
npm install

npm run start:anvil
```

In Terminal 2
```sh
cp .env.example .env
cp contracts/.env.example contracts/.env

npm run build

npm run deploy:core

npm run deploy:robotic-agent

npm run extract:abis

npm run start:operator
```

In Terminal 3
```sh
npm run start:traffic
```

## Running fronted

```sh
cd frontend
npm run dev
```

## Running nillion backend

```sh
cd src/nillion
npm run start
```

## Running agent

```sh
npm start
```

## Running ROS
### Step 1: Source the workspace and start the Multi-Rover Simulation
Run the following command to spawn both rovers in Gazebo:
```sh
cd <workspace> ; source devel/setup.bash
```
```sh
roslaunch ethbot multi_rover.launch
```


### Step 2: Run scrit to move robot and start the game based on energy recieved

```sh
rosrun ethbot control_rover.py
```
