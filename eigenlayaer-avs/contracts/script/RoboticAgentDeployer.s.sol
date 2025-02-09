// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/Test.sol";
import {RoboticAgentDeploymentLib} from "./utils/RoboticAgentDeploymentLib.sol";
import {CoreDeploymentLib} from "./utils/CoreDeploymentLib.sol";
import {UpgradeableProxyLib} from "./utils/UpgradeableProxyLib.sol";
import {StrategyBase} from "@eigenlayer/contracts/strategies/StrategyBase.sol";
import {ERC20Mock} from "../test/ERC20Mock.sol";
import {TransparentUpgradeableProxy} from
    "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {StrategyFactory} from "@eigenlayer/contracts/strategies/StrategyFactory.sol";
import {StrategyManager} from "@eigenlayer/contracts/core/StrategyManager.sol";
import {IRewardsCoordinator} from "@eigenlayer/contracts/interfaces/IRewardsCoordinator.sol";



import {
    Quorum,
    StrategyParams,
    IStrategy
} from "@eigenlayer-middleware/src/interfaces/IECDSAStakeRegistryEventsAndErrors.sol";

import "forge-std/Test.sol";

contract RoboticAgentDeployer is Script, Test {
    using CoreDeploymentLib for *;
    using UpgradeableProxyLib for address;

    address private deployer;
    address proxyAdmin;
    address rewardsOwner;
    address rewardsInitiator;
    IStrategy roboticAgentStrategy;
    CoreDeploymentLib.DeploymentData coreDeployment;
    RoboticAgentDeploymentLib.DeploymentData roboticAgentDeployment;
    RoboticAgentDeploymentLib.DeploymentConfigData roboticAgentConfig;
    Quorum internal quorum;
    ERC20Mock token;
    function setUp() public virtual {
        deployer = vm.rememberKey(vm.envUint("PRIVATE_KEY"));
        vm.label(deployer, "Deployer");

        roboticAgentConfig = RoboticAgentDeploymentLib.readDeploymentConfigValues("config/hello-world/", block.chainid);


        coreDeployment = CoreDeploymentLib.readDeploymentJson("deployments/core/", block.chainid);
    }

    function run() external {
        vm.startBroadcast(deployer);
        rewardsOwner = roboticAgentConfig.rewardsOwner;
        rewardsInitiator = roboticAgentConfig.rewardsInitiator;

        token = new ERC20Mock();
        roboticAgentStrategy = IStrategy(StrategyFactory(coreDeployment.strategyFactory).deployNewStrategy(token));


        quorum.strategies.push(
            StrategyParams({strategy: roboticAgentStrategy, multiplier: 10_000})
        );


        proxyAdmin = UpgradeableProxyLib.deployProxyAdmin();


        roboticAgentDeployment =
            RoboticAgentDeploymentLib.deployContracts(proxyAdmin, coreDeployment, quorum, rewardsInitiator, rewardsOwner);

        roboticAgentDeployment.strategy = address(roboticAgentStrategy);
        roboticAgentDeployment.token = address(token);

        vm.stopBroadcast();
        verifyDeployment();
        RoboticAgentDeploymentLib.writeDeploymentJson(roboticAgentDeployment);
    }

    function verifyDeployment() internal view {
        require(
            roboticAgentDeployment.stakeRegistry != address(0), "StakeRegistry address cannot be zero"
        );
        require(
            roboticAgentDeployment.roboticAgentServiceManager != address(0),
            "RoboticAgentServiceManager address cannot be zero"
        );
        require(roboticAgentDeployment.strategy != address(0), "Strategy address cannot be zero");
        require(proxyAdmin != address(0), "ProxyAdmin address cannot be zero");
        require(
            coreDeployment.delegationManager != address(0),
            "DelegationManager address cannot be zero"
        );
        require(coreDeployment.avsDirectory != address(0), "AVSDirectory address cannot be zero");
    }
}