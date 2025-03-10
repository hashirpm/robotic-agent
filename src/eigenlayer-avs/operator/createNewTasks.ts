import { ethers } from "ethers";
import * as dotenv from "dotenv";
const fs = require('fs');
const path = require('path');
dotenv.config();

// Setup env variables
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
/// TODO: Hack
let chainId = 31337;

const avsDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../contracts/deployments/robotic-agent/${chainId}.json`), 'utf8'));
const roboticAgentServiceManagerAddress = avsDeploymentData.addresses.roboticAgentServiceManager;
const roboticAgentServiceManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/RoboticAgentServiceManager.json'), 'utf8'));
// Initialize contract objects from ABIs
const roboticAgentServiceManager = new ethers.Contract(roboticAgentServiceManagerAddress, roboticAgentServiceManagerABI, wallet);



export async function createNewTask(username: string) {
  try {
    // Send a transaction to the createNewTask function
    const tx = await roboticAgentServiceManager.createNewTask(username);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    console.log(`Transaction successful with hash: ${receipt.hash}`);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}

// // Function to create a new task with a random name every 15 seconds
// function startCreatingTasks() {
//   createNewTask(USERNAME);
// }

// // Start the process
// startCreatingTasks();