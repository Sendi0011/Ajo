// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BaseSafeFactory.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // token and treasury addresses
        address token = vm.envAddress("TOKEN_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        BaseSafeFactory factory = new BaseSafeFactory(token, treasury);
        console.log("Factory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
