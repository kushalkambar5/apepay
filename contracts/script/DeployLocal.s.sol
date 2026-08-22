// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.15;

import "forge-std/Script.sol";

contract DeployLocal is Script {
    function run() external {
        console.log("ApePay Local Deployment Script initialized");
        console.log("Target Chain ID:", block.chainid);
    }
}
