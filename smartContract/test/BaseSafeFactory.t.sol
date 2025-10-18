// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BaseSafeFactory.sol";

contract MockERC20 {
    string public name = "Mock USDT";
    string public symbol = "mUSDT";
    uint8 public decimals = 18;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insuf");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (from != msg.sender) {
            uint256 al = allowance[from][msg.sender];
            require(al >= amount, "allow");
            allowance[from][msg.sender] = al - amount;
        }
        require(balanceOf[from] >= amount, "bal");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract BaseSafeRotationalTest is Test {
    MockERC20 public token;
    BaseSafeFactory public factory;

    address deployer = address(0x8a7AEad289a7CFE47891C4a320c773b254581fcB);
    address alice = address(0xA100000000000000000000000000000000000000);
    address bob = address(0xB100000000000000000000000000000000000000);
    address chika = address(0xe815f3b9fCA94bA624Eb7f85ADb8B1B2Da005B33);
    address relayer = address(0x8a7AEad289a7CFE47891C4a320c773b254581fcB);
    address testTreasury = address(0xE100000000000000000000000000000000000000);

    function setUp() public {
        token = new MockERC20();
        token.mint(alice, 1000 ether);
        token.mint(bob, 1000 ether);
        token.mint(chika, 1000 ether);
        token.mint(relayer, 1000 ether);

        vm.prank(deployer);
        factory = new BaseSafeFactory(address(token), testTreasury);
    }

    function testCreateRotationalPoolAndHappyPath() public {
        address[] memory members = new address[](3);
        members[0] = alice;
        members[1] = bob;
        members[2] = chika;

        vm.prank(alice);
        address poolAddr = factory.createRotational(members, 10 ether, 604800, 201, 201);
        BaseSafeRotational pool = BaseSafeRotational(poolAddr);

        vm.startPrank(alice);
        token.approve(poolAddr, 10 ether);
        pool.deposit();
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(poolAddr, 10 ether);
        pool.deposit();
        vm.stopPrank();

        vm.startPrank(chika);
        token.approve(poolAddr, 10 ether);
        pool.deposit();
        vm.stopPrank();

        vm.warp(block.timestamp + 604800 + 1);

        vm.prank(relayer);
        pool.triggerPayout();

        uint256 totalCollected = 10 ether * 3;
        uint256 treasuryCut = (totalCollected * 201) / 10000;
        uint256 relayerCut = (totalCollected * 201) / 10000;
        uint256 payout = totalCollected - treasuryCut - relayerCut;

        assertEq(token.balanceOf(alice), 1000 ether - 10 ether + payout);
        assertEq(token.balanceOf(relayer), 1000 ether + relayerCut);
        assertEq(token.balanceOf(testTreasury), treasuryCut);
    }

    function testRotationalSlashing() public {
        address[] memory members = new address[](3);
        members[0] = alice;
        members[1] = bob;
        members[2] = chika;

        vm.prank(alice);
        address poolAddr = factory.createRotational(members, 10 ether, 604800, 0, 20);
        BaseSafeRotational pool = BaseSafeRotational(poolAddr);

        vm.startPrank(alice);
        token.approve(poolAddr, 10 ether);
        pool.deposit();
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(poolAddr, 10 ether);
        pool.deposit();
        vm.stopPrank();

        vm.warp(block.timestamp + 604800 + 2);

        vm.prank(relayer);
        pool.triggerPayout();

        uint256 totalCollected = 10 ether * 2;
        uint256 relayerCut = (totalCollected * 20) / 10000;
        uint256 payout = totalCollected - relayerCut;

        assertEq(token.balanceOf(relayer), 1000 ether + relayerCut);
        assertEq(token.balanceOf(alice), 1000 ether - 10 ether + payout);
    }
}

contract BaseSafeTargetTest is Test {
    MockERC20 public token;
    BaseSafeFactory public factory;

    address deployer = address(0x8a7AEad289a7CFE47891C4a320c773b254581fcB);
    address alice = address(0xA100000000000000000000000000000000000000);
    address bob = address(0xB100000000000000000000000000000000000000);
    address chika = address(0xe815f3b9fCA94bA624Eb7f85ADb8B1B2Da005B33);
    address testTreasury = address(0xE100000000000000000000000000000000000000);

    function setUp() public {
        token = new MockERC20();
        token.mint(alice, 100 ether);
        token.mint(bob, 100 ether);
        token.mint(chika, 100 ether);

        vm.prank(deployer);
        factory = new BaseSafeFactory(address(token), testTreasury);
    }

    function testTargetPoolContributionAndWithdrawal() public {
        address[] memory members = new address[](3);
        members[0] = alice;
        members[1] = bob;
        members[2] = chika;

        uint256 deadline = block.timestamp + 30 days;

        vm.prank(alice);
        address poolAddr = factory.createTarget(members, 30 ether, deadline, 100); // 1% fee
        BaseSafeTarget pool = BaseSafeTarget(poolAddr);

        // Each member contributes 10 ether
        vm.startPrank(alice);
        token.approve(poolAddr, 10 ether);
        pool.contribute(10 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(poolAddr, 10 ether);
        pool.contribute(10 ether);
        vm.stopPrank();

        vm.startPrank(chika);
        token.approve(poolAddr, 10 ether);
        pool.contribute(10 ether);
        vm.stopPrank();

        assertEq(pool.totalContributed(), 30 ether);
        assert(pool.completed());

        // Withdraw
        vm.prank(alice);
        pool.withdraw();

        uint256 totalFees = (30 ether * 100) / 10000; // 0.3 ether
        uint256 netAmount = 30 ether - totalFees;
        uint256 aliceShare = (10 ether * netAmount) / 30 ether;

        assertEq(token.balanceOf(alice), 100 ether - 10 ether + aliceShare);
    }

    function testTargetPoolDeadlineWithdrawal() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        uint256 deadline = block.timestamp + 10 days;

        vm.prank(alice);
        address poolAddr = factory.createTarget(members, 50 ether, deadline, 100);
        BaseSafeTarget pool = BaseSafeTarget(poolAddr);

        // Partial contributions
        vm.startPrank(alice);
        token.approve(poolAddr, 15 ether);
        pool.contribute(15 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(poolAddr, 15 ether);
        pool.contribute(15 ether);
        vm.stopPrank();

        // Move past deadline
        vm.warp(block.timestamp + 11 days);

        // Should allow withdrawal even though target not reached
        vm.prank(alice);
        pool.withdraw();

        uint256 totalContributed = 30 ether;
        uint256 totalFees = (totalContributed * 100) / 10000;
        uint256 netAmount = totalContributed - totalFees;
        uint256 aliceShare = (15 ether * netAmount) / totalContributed;

        assertEq(token.balanceOf(alice), 100 ether - 15 ether + aliceShare);
    }
}

contract BaseSafeFlexibleTest is Test {
    MockERC20 public token;
    BaseSafeFactory public factory;

    address deployer = address(0x8a7AEad289a7CFE47891C4a320c773b254581fcB);
    address alice = address(0xA100000000000000000000000000000000000000);
    address bob = address(0xB100000000000000000000000000000000000000);
    address chika = address(0xe815f3b9fCA94bA624Eb7f85ADb8B1B2Da005B33);
    address testTreasury = address(0xE100000000000000000000000000000000000000);

    function setUp() public {
        token = new MockERC20();
        token.mint(alice, 100 ether);
        token.mint(bob, 100 ether);
        token.mint(chika, 100 ether);

        vm.prank(deployer);
        factory = new BaseSafeFactory(address(token), testTreasury);
    }

    function testFlexiblePoolDepositAndWithdraw() public {
        address[] memory members = new address[](3);
        members[0] = alice;
        members[1] = bob;
        members[2] = chika;

        vm.prank(alice);
        address poolAddr = factory.createFlexible(members, 1 ether, 100, false, 100); // 1% withdrawal fee, 1% treasury fee
        BaseSafeFlexible pool = BaseSafeFlexible(poolAddr);

        // Members deposit
        vm.startPrank(alice);
        token.approve(poolAddr, 20 ether);
        pool.deposit(20 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(poolAddr, 15 ether);
        pool.deposit(15 ether);
        vm.stopPrank();

        assertEq(pool.getBalance(alice), 20 ether);
        assertEq(pool.getBalance(bob), 15 ether);

        // Alice withdraws 10 ether
        vm.prank(alice);
        pool.withdraw(10 ether);

        uint256 fee = (10 ether * 100) / 10000; // 0.1 ether
        uint256 netWithdrawal = 10 ether - fee;

        assertEq(pool.getBalance(alice), 10 ether);
        assertEq(token.balanceOf(alice), 100 ether - 20 ether + netWithdrawal);
        assertEq(token.balanceOf(testTreasury), fee);
    }

    function testFlexiblePoolWithYield() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        vm.prank(alice);
        address poolAddr = factory.createFlexible(members, 1 ether, 50, true, 100); // yield enabled
        BaseSafeFlexible pool = BaseSafeFlexible(poolAddr);

        // Mint extra tokens to distribute as yield
        token.mint(address(pool), 10 ether);

        vm.startPrank(alice);
        token.approve(poolAddr, 20 ether);
        pool.deposit(20 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(poolAddr, 30 ether);
        pool.deposit(30 ether);
        vm.stopPrank();

        // Distribute 10 ether yield (alice gets 4, bob gets 6 proportionally)
        vm.prank(alice); // alice is owner
        pool.distributeYield(10 ether);

        assertEq(pool.getBalance(alice), 24 ether); // 20 + (10 * 20/50)
        assertEq(pool.getBalance(bob), 36 ether); // 30 + (10 * 30/50)
    }

    function testFlexiblePoolMinimumDeposit() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        vm.prank(alice);
        address poolAddr = factory.createFlexible(members, 5 ether, 50, false, 100);
        BaseSafeFlexible pool = BaseSafeFlexible(poolAddr);

        // Try to deposit below minimum (should fail)
        vm.startPrank(alice);
        token.approve(poolAddr, 2 ether);
        vm.expectRevert("below minimum");
        pool.deposit(2 ether);
        vm.stopPrank();

        // Deposit at minimum works
        vm.startPrank(alice);
        token.approve(poolAddr, 5 ether);
        pool.deposit(5 ether);
        vm.stopPrank();

        assertEq(pool.getBalance(alice), 5 ether);
    }
}

contract BaseSafeFactoryTest is Test {
    MockERC20 public token;
    BaseSafeFactory public factory;

    address deployer = address(0x8a7AEad289a7CFE47891C4a320c773b254581fcB);
    address alice = address(0xA100000000000000000000000000000000000000);
    address bob = address(0xB100000000000000000000000000000000000000);
    address chika = address(0xe815f3b9fCA94bA624Eb7f85ADb8B1B2Da005B33);
    address testTreasury = address(0xE100000000000000000000000000000000000000);

    function setUp() public {
        token = new MockERC20();
        token.mint(alice, 100 ether);
        token.mint(bob, 100 ether);
        token.mint(chika, 100 ether);

        vm.prank(deployer);
        factory = new BaseSafeFactory(address(token), testTreasury);
    }

    function testFactoryCreatesAllThreePoolTypes() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        // Create rotational
        vm.prank(alice);
        address rotAddr = factory.createRotational(members, 10 ether, 604800, 100, 100);
        assert(rotAddr != address(0));

        // Create target
        vm.prank(alice);
        address tarAddr = factory.createTarget(members, 20 ether, block.timestamp + 30 days, 100);
        assert(tarAddr != address(0));

        // Create flexible
        vm.prank(alice);
        address flexAddr = factory.createFlexible(members, 1 ether, 100, false, 100);
        assert(flexAddr != address(0));

        // Verify all are tracked
        assert(factory.allRotational(0) == rotAddr);
        assert(factory.allTarget(0) == tarAddr);
        assert(factory.allFlexible(0) == flexAddr);
    }

    function testFactorySetTreasury() public {
        address newTreasury = address(0xF200000000000000000000000000000000000000);

        vm.prank(deployer);
        factory.setTreasury(newTreasury);

        assert(factory.treasury() == newTreasury);
    }

    function testFactoryOnlyOwnerCanSetTreasury() public {
        address newTreasury = address(0xF200000000000000000000000000000000000000);

        vm.prank(alice);
        vm.expectRevert("only owner");
        factory.setTreasury(newTreasury);
    }
}
