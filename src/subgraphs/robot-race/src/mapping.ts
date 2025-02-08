import {
  RobotRegistered,
  MinimumStakeUpdated,
  StakeAdded,
  TrapPurchased,
  RaceCreated,
  RaceCompleted,
  UpdateRobotDataCall,
} from "../generated/RobotRaceManager/RobotRaceManager";
import { Robot, Race, Staker, Stake, Trap } from "../generated/schema";
import { BigInt, Address } from "@graphprotocol/graph-ts";

export function handleRobotRegistered(event: RobotRegistered): void {
  let robot = new Robot(event.params.robot.toHexString());
  robot.totalStake = BigInt.fromI32(0);
  robot.minimumStake = event.params.minimumStake;
  robot.save();
}

export function handleMinimumStakeUpdated(event: MinimumStakeUpdated): void {
  let robot = Robot.load(event.params.robot.toHexString());
  if (robot) {
    robot.minimumStake = event.params.newMinimumStake;
    robot.save();
  }
}

export function handleStakeAdded(event: StakeAdded): void {
  let robot = Robot.load(event.params.robot.toHexString());
  let staker = Staker.load(event.params.staker.toHexString());

  if (!staker) {
    staker = new Staker(event.params.staker.toHexString());
    staker.robot = event.params.robot.toHexString();
    staker.totalStaked = BigInt.fromI32(0);
  }

  staker.totalStaked = staker.totalStaked.plus(event.params.amount);
  staker.save();

  if (robot) {
    robot.totalStake = robot.totalStake.plus(event.params.amount);
    robot.save();

    // Create stake entity
    let stakeId = event.params.robot
      .toHexString()
      .concat("-")
      .concat(event.params.staker.toHexString())
      .concat("-")
      .concat(event.block.timestamp.toString());

    let stake = new Stake(stakeId);
    stake.race = event.params.robot.toHexString();
    stake.robot = event.params.robot.toHexString();
    stake.staker = event.params.staker.toHexString();
    stake.amount = event.params.amount;
    stake.timestamp = event.block.timestamp;
    stake.save();
  }
}

export function handleRaceCreated(event: RaceCreated): void {
  let race = new Race(event.params.raceId.toString());
  race.robot1 = event.params.robot1.toHexString();
  race.robot2 = event.params.robot2.toHexString();
  race.isActive = true;
  race.isCompleted = false;
  race.totalPrizePool = BigInt.fromI32(0);
  race.raceTime = event.params.raceTime;
  race.stakingEndTime = event.params.stakingEndTime;
  race.save();
}

export function handleRaceCompleted(event: RaceCompleted): void {
  let race = Race.load(event.params.raceId.toString());
  if (race) {
    race.isActive = false;
    race.isCompleted = true;
    race.winner = event.params.winner.toHexString();
    race.totalPrizePool = event.params.stakersReward.plus(
      event.params.robotReward
    );
    race.save();
  }
}

export function handleTrapPurchased(event: TrapPurchased): void {
  let trapId = event.params.raceId
    .toString()
    .concat("-")
    .concat(event.params.buyer.toHexString())
    .concat("-")
    .concat(event.block.timestamp.toString());

  let trap = new Trap(trapId);
  trap.race = event.params.raceId.toString();
  trap.buyer = event.params.buyer.toHexString();
  trap.amount = event.params.amountBurned;
  trap.robot = event.params.robot.toHexString();
  trap.timestamp = event.block.timestamp;
  trap.save();
}
export function handleUpdateRobotData(call: UpdateRobotDataCall): void {
  let robotId = call.inputs.robot.toHexString();
  let robot = Robot.load(robotId);

  if (robot) {
    robot.basename = call.inputs.basename;
    robot.twitter = call.inputs.twitter;
    robot.tokenName = call.inputs.tokenName;
    robot.tokenAddress = call.inputs.tokenAddress.toHexString();
    robot.level = call.inputs.level;
    robot.save();
  }
}
