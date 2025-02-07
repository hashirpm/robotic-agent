// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RobotRaceManager {
    IERC20 public roboToken;

    struct Robot {
        uint256 totalStake;
        uint256 minimumStake;     
        address[] stakers;
        mapping(address => uint256) stakes;
        string basename;
        string twitter;
        string tokenName;
        address tokenAddress;
        uint256 level;
    }

    struct Race {
        address robot1;
        address robot2;
        bool isActive;
        bool isCompleted;
        address winner;
        uint256 totalPrizePool;
        uint256 raceTime;         // Unix timestamp for race start
        uint256 stakingEndTime;   // Unix timestamp when staking ends (1 hour before race)
    }

    // Constants
    uint256 public constant STAKERS_SHARE = 70;
    uint256 public constant ROBOT_SHARE = 30;
    uint256 public constant STAKING_BUFFER_TIME = 1 hours;

    // Storage
    mapping(uint256 => Race) public races;
    mapping(address => Robot) public robots;
    mapping(address => bool) public registeredRobots;
    uint256 public raceCounter;

    // Events
    event RobotRegistered(address indexed robot, uint256 minimumStake);
    event MinimumStakeUpdated(address indexed robot, uint256 newMinimumStake);
    event StakeAdded(address indexed robot, address indexed staker, uint256 amount);
    event TrapPurchased(address indexed buyer, uint256 amountBurned, uint256 raceId);
    event RaceCreated(
        uint256 indexed raceId, 
        address robot1, 
        address robot2, 
        uint256 raceTime,
        uint256 stakingEndTime
    );
    event RaceCompleted(
        uint256 indexed raceId, 
        address winner, 
        uint256 stakersReward, 
        uint256 robotReward
    );

    constructor(address _roboToken) {
        roboToken = IERC20(_roboToken);
    }

    function registerRobot(address robot, uint256 minimumStake) external {
        require(robot != address(0), "Invalid robot address");
        require(!registeredRobots[robot], "Robot already registered");
        require(minimumStake > 0, "Invalid minimum stake");

        robots[robot].minimumStake = minimumStake;
        registeredRobots[robot] = true;

        emit RobotRegistered(robot, minimumStake);
    }

    function updateMinimumStake(address robot, uint256 newMinimumStake) external {
        require(registeredRobots[robot], "Robot not registered");
        require(newMinimumStake > 0, "Invalid minimum stake");

        robots[robot].minimumStake = newMinimumStake;
        emit MinimumStakeUpdated(robot, newMinimumStake);
    }

    function updateRobotData(
        address robot,
        string memory basename,
        string memory twitter,
        string memory tokenName,
        address tokenAddress,
        uint256 level
    ) external {
        require(registeredRobots[robot], "Robot not registered");

        Robot storage robotData = robots[robot];
        robotData.basename = basename;
        robotData.twitter = twitter;
        robotData.tokenName = tokenName;
        robotData.tokenAddress = tokenAddress;
        robotData.level = level;

        emit MinimumStakeUpdated(robot, robotData.minimumStake);  // Reuse the event for now
    }

    function getRobotData(address robot) external view returns (
        uint256 totalStake,
        uint256 minimumStake,
        address[] memory stakers,
        string memory basename,
        string memory twitter,
        string memory tokenName,
        address tokenAddress,
        uint256 level
    ) {
        require(registeredRobots[robot], "Robot not registered");

        Robot storage robotData = robots[robot];
        return (
            robotData.totalStake,
            robotData.minimumStake,
            robotData.stakers,
            robotData.basename,
            robotData.twitter,
            robotData.tokenName,
            robotData.tokenAddress,
            robotData.level
        );
    }

    function getAllUpcomingRaces() external view returns (Race[] memory) {
        uint256 upcomingRaceCount = 0;
        for (uint256 i = 1; i <= raceCounter; i++) {
            if (races[i].raceTime > block.timestamp && !races[i].isCompleted) {
                upcomingRaceCount++;
            }
        }

        Race[] memory upcomingRaces = new Race[](upcomingRaceCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= raceCounter; i++) {
            if (races[i].raceTime > block.timestamp && !races[i].isCompleted) {
                upcomingRaces[index] = races[i];
                index++;
            }
        }
        return upcomingRaces;
    }

    function addStake(address robot, uint256 amount) external {
        require(amount > 0, "Stake amount must be greater than 0");
        require(registeredRobots[robot], "Robot not registered");
        
        uint256 activeRaceId = findActiveRaceForRobot(robot);
        require(activeRaceId > 0, "No active race found for robot");
        
        Race storage race = races[activeRaceId];
        Robot storage robotData = robots[robot];
        
        require(block.timestamp < race.stakingEndTime, "Staking period has ended");
        require(amount >= robotData.minimumStake, "Stake amount below minimum");

        require(roboToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (robotData.stakes[msg.sender] == 0) {
            robotData.stakers.push(msg.sender);
        }
        robotData.stakes[msg.sender] += amount;
        robotData.totalStake += amount;

        emit StakeAdded(robot, msg.sender, amount);
    }

    function createRace(address robot1, address robot2, uint256 raceTime) external {
        require(registeredRobots[robot1] && registeredRobots[robot2], "Unregistered robot");
        require(robot1 != robot2, "Cannot race against self");
        require(raceTime > block.timestamp + STAKING_BUFFER_TIME, "Race time too soon");

        uint256 stakingEndTime = raceTime - STAKING_BUFFER_TIME;
        
        raceCounter++;
        races[raceCounter] = Race({
            robot1: robot1,
            robot2: robot2,
            isActive: true,
            isCompleted: false,
            winner: address(0),
            totalPrizePool: 0,
            raceTime: raceTime,
            stakingEndTime: stakingEndTime
        });

        emit RaceCreated(raceCounter, robot1, robot2, raceTime, stakingEndTime);
    }

    function completeRace(uint256 raceId, address winner) external {
        Race storage race = races[raceId];
        require(race.isActive, "Race not active");
        require(!race.isCompleted, "Race already completed");
        require(block.timestamp >= race.raceTime, "Race hasn't started yet");
        require(winner == race.robot1 || winner == race.robot2, "Invalid winner");

        Robot storage winningRobot = robots[winner];
        
        race.isCompleted = true;
        race.isActive = false;
        race.winner = winner;

        race.totalPrizePool = robots[race.robot1].totalStake + robots[race.robot2].totalStake;

        uint256 stakersReward = (race.totalPrizePool * STAKERS_SHARE) / 100;
        uint256 robotReward = (race.totalPrizePool * ROBOT_SHARE) / 100;

        require(roboToken.transfer(winner, robotReward), "Robot reward transfer failed");

        for (uint256 i = 0; i < winningRobot.stakers.length; i++) {
            address staker = winningRobot.stakers[i];
            uint256 stakerShare = (stakersReward * winningRobot.stakes[staker]) / winningRobot.totalStake;
            require(roboToken.transfer(staker, stakerShare), "Staker reward transfer failed");
        }

        emit RaceCompleted(raceId, winner, stakersReward, robotReward);
    }
   function buyTrap(uint256 raceId, uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(races[raceId].isActive, "Race not active");

        require(roboToken.transferFrom(msg.sender, address(this), amount), "Trap purchase failed");

        require(roboToken.transfer(address(0), amount), "Burn failed");

        emit TrapPurchased(msg.sender, amount, raceId);
    }
    function findActiveRaceForRobot(address robot) public view returns (uint256) {
        for (uint256 i = raceCounter; i > 0; i--) {
            Race storage race = races[i];
            if (race.isActive && !race.isCompleted && 
                (race.robot1 == robot || race.robot2 == robot)) {
                return i;
            }
        }
        return 0;
    }
}
