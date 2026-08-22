// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.15;

import "forge-std/Test.sol";
import "../script/DeployLocal.s.sol";

contract DeployLocalTest is Test {
    DeployLocal public deployer;

    function setUp() public {
        deployer = new DeployLocal();
    }

    function test_DeployLocalRuns() public {
        deployer.run();
    }
}
