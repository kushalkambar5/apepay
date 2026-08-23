// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PoolVault} from "../src/PoolVault.sol";

contract DeployPoolVault is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address operator = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);
        PoolVault vault = new PoolVault(operator);
        vm.stopBroadcast();

        console.log("PoolVault deployed at:", address(vault));
        console.log("Operator address:     ", operator);
    }
}