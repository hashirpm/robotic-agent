# ROBOAGENTIC BATTLE ROS SIMULATION

This project is an AI-powered robotic racing game where autonomous robots, controlled via ROS and simulated in Gazebo, dynamically adjust their speed and energy using on-chain and off-chain data stored in Nillion Secret Vaults, while players can strategically influence the race by staking tokens and setting traps, with the winner determined by a smart contract and rewards distributed accordingly. 

Here we simulates two independent rovers (`rover1` and `rover2`) in Gazebo using ROS. Each rover has a differential drive controller and can be controlled independently.w

## Prerequisites

Ensure you have the following installed:

- **ROS (Noetic or Melodic)**
- **Gazebo**
- **xacro**

Install dependencies if necessary:
```sh
sudo apt-get update
sudo apt-get install ros-$(rosversion -d)-gazebo-ros ros-$(rosversion -d)-gazebo-ros-control ros-$(rosversion -d)-joint-state-publisher-gui ros-$(rosversion -d)-teleop-twist-keyboard
```

## Folder Structure
```
ethbot/
├── urdf/
│   ├── rover1.urdf.xacro
│   ├── rover2.urdf.xacro
│   ├── controller1_gazebo.xacro
|   ├── controller2_gazebo.xacro
├── config/
│   ├── rover_controllers.yaml
│   ├── world_file
├── launch/
│   ├── multi_rover.launch
├── meshes/
│   ├── left_tire.stl
|   ├── right_tire.stl
├── scripts/
│   ├── control_rovers.py
└── README.md
```

## How to Launch the Simulation

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
