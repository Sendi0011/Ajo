// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {MockERC20} from "../test/BaseSafeFactory.t.sol";

contract DeployMockToken is Script {
    function run() external {
        vm.startBroadcast();

        MockERC20 token = new MockERC20();
        console.log("Mock Token deployed at:", address(token));

        vm.stopBroadcast();
    }
}
