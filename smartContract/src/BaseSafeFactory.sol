// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/* ========== ROTATIONAL POOL ========== */
contract BaseSafeRotational is Ownable(msg.sender) {
    address[] public members;
    mapping(address => bool) public hasDeposited;
    uint256 public totalMembers;
    uint256 public depositAmount;
    uint256 public currentRound;
    uint256 public treasuryFeeBps;
    uint256 public relayerFeeBps;
    address public treasury;
    uint256 public nextPayoutTime;
    uint256 public roundDuration;
    bool public active;
    IERC20 public immutable token;

    event Deposit(address indexed user, uint256 amount);
    event Payout(address indexed beneficiary, uint256 amount, uint256 treasuryCut, uint256 relayerCut);
    event Slashed(address indexed offender, uint256 penalty);
    event PoolCompleted();

    uint256 private constant BPS = 10000;

    constructor(
        address _token,
        address[] memory _members,
        uint256 _depositAmount,
        uint256 _roundDuration,
        uint256 _treasuryFeeBps,
        uint256 _relayerFeeBps,
        address _treasury
    ) {
        require(_token != address(0), "token 0");
        require(_members.length >= 2, "need >=2 members");
        require(_depositAmount > 0, "deposit 0");
        require(_roundDuration > 0, "roundDuration 0");
        require(_treasury != address(0), "treasury 0");

        token = IERC20(_token);
        members = _members;
        totalMembers = _members.length;
        depositAmount = _depositAmount;
        roundDuration = _roundDuration;
        treasuryFeeBps = _treasuryFeeBps;
        relayerFeeBps = _relayerFeeBps;
        treasury = _treasury;

        currentRound = 0;
        nextPayoutTime = block.timestamp + roundDuration;
        active = true;
    }

    function deposit() external {
        require(active, "pool inactive");
        require(isMember(msg.sender), "not member");
        require(!hasDeposited[msg.sender], "already deposited");

        bool ok = token.transferFrom(msg.sender, address(this), depositAmount);
        require(ok, "transferFrom failed");

        hasDeposited[msg.sender] = true;
        emit Deposit(msg.sender, depositAmount);
    }

    function triggerPayout() external {
        require(active, "pool inactive");
        require(block.timestamp >= nextPayoutTime, "too early");

        uint256 depositCount = 0;
        for (uint256 i = 0; i < totalMembers; i++) {
            if (hasDeposited[members[i]]) depositCount++;
        }

        if (depositCount < totalMembers) {
            uint256 penalty = (depositAmount * 10) / 100;
            for (uint256 i = 0; i < totalMembers; i++) {
                address candidate = members[i];
                if (!hasDeposited[candidate]) {
                    try IERC20(token).transferFrom(candidate, address(this), penalty) returns (bool success) {
                        if (success) {
                            uint256 toTreasury = penalty / 2;
                            if (toTreasury > 0) {
                                IERC20(token).transfer(treasury, toTreasury);
                            }
                            emit Slashed(candidate, penalty);
                        }
                    } catch {}
                }
            }

            depositCount = 0;
            for (uint256 i = 0; i < totalMembers; i++) {
                if (hasDeposited[members[i]]) depositCount++;
            }
            require(depositCount > 0, "no deposits");
        }

        uint256 totalCollected = depositAmount * depositCount;
        uint256 treasuryCut = (totalCollected * treasuryFeeBps) / BPS;
        uint256 relayerCut = (totalCollected * relayerFeeBps) / BPS;
        uint256 payoutAmount = totalCollected - treasuryCut - relayerCut;

        address beneficiary = members[currentRound];

        if (treasuryCut > 0) {
            bool tOk = token.transfer(treasury, treasuryCut);
            require(tOk, "treasury transfer failed");
        }

        if (relayerCut > 0) {
            bool rOk = token.transfer(msg.sender, relayerCut);
            require(rOk, "relayer transfer failed");
        }

        bool pOk = token.transfer(beneficiary, payoutAmount);
        require(pOk, "payout failed");

        emit Payout(beneficiary, payoutAmount, treasuryCut, relayerCut);

        for (uint256 i = 0; i < totalMembers; i++) {
            hasDeposited[members[i]] = false;
        }

        currentRound = (currentRound + 1);
        if (currentRound >= totalMembers) {
            active = false;
            emit PoolCompleted();
        } else {
            nextPayoutTime = block.timestamp + roundDuration;
        }
    }

    function isMember(address who) public view returns (bool) {
        for (uint256 i = 0; i < totalMembers; i++) {
            if (members[i] == who) return true;
        }
        return false;
    }

    function membersList() external view returns (address[] memory) {
        return members;
    }
}

/* ========== TARGET POOL ========== */
contract BaseSafeTarget is Ownable(msg.sender) {
    address[] public members;
    mapping(address => uint256) public contributions;
    uint256 public totalMembers;
    uint256 public targetAmount;
    uint256 public deadline;
    uint256 public totalContributed;
    bool public completed;
    bool public active;
    address public treasury;
    uint256 public treasuryFeeBps;
    IERC20 public immutable token;

    event Contributed(address indexed user, uint256 amount);
    event TargetReached();
    event Withdrawal(address indexed user, uint256 amount);

    uint256 private constant BPS = 10000;

    constructor(
        address _token,
        address[] memory _members,
        uint256 _targetAmount,
        uint256 _deadline,
        uint256 _treasuryFeeBps,
        address _treasury
    ) {
        require(_token != address(0), "token 0");
        require(_members.length >= 2, "need >=2 members");
        require(_targetAmount > 0, "target 0");
        require(_deadline > block.timestamp, "deadline past");
        require(_treasury != address(0), "treasury 0");

        token = IERC20(_token);
        members = _members;
        totalMembers = _members.length;
        targetAmount = _targetAmount;
        deadline = _deadline;
        treasuryFeeBps = _treasuryFeeBps;
        treasury = _treasury;
        active = true;
    }

    function contribute(uint256 amount) external {
        require(active, "pool inactive");
        require(isMember(msg.sender), "not member");
        require(block.timestamp <= deadline, "deadline passed");
        require(amount > 0, "amount 0");

        bool ok = token.transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");

        contributions[msg.sender] += amount;
        totalContributed += amount;

        emit Contributed(msg.sender, amount);

        if (totalContributed >= targetAmount) {
            completed = true;
            emit TargetReached();
        }
    }

    function withdraw() external {
        require(completed || block.timestamp > deadline, "not ready");
        require(contributions[msg.sender] > 0, "no contribution");

        uint256 share = contributions[msg.sender];
        uint256 totalFees = (totalContributed * treasuryFeeBps) / BPS;
        uint256 netAmount = totalContributed - totalFees;
        uint256 userShare = (share * netAmount) / totalContributed;

        contributions[msg.sender] = 0;

        bool ok = token.transfer(msg.sender, userShare);
        require(ok, "transfer failed");

        emit Withdrawal(msg.sender, userShare);
    }

    function treasuryWithdraw() external onlyOwner {
        require(completed || block.timestamp > deadline, "not ready");

        uint256 totalFees = (totalContributed * treasuryFeeBps) / BPS;
        require(totalFees > 0, "no fees");

        bool ok = token.transfer(treasury, totalFees);
        require(ok, "transfer failed");
    }

    function isMember(address who) public view returns (bool) {
        for (uint256 i = 0; i < totalMembers; i++) {
            if (members[i] == who) return true;
        }
        return false;
    }

    function membersList() external view returns (address[] memory) {
        return members;
    }
}

/* ========== FLEXIBLE POOL ========== */
contract BaseSafeFlexible is Ownable(msg.sender) {
    address[] public members;
    mapping(address => uint256) public balances;
    uint256 public totalMembers;
    uint256 public minimumDeposit;
    uint256 public withdrawalFeeBps;
    uint256 public totalBalance;
    bool public active;
    address public treasury;
    uint256 public treasuryFeeBps;
    bool public yieldEnabled;
    IERC20 public immutable token;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 fee);
    event YieldDistributed(uint256 amount);

    uint256 private constant BPS = 10000;

    constructor(
        address _token,
        address[] memory _members,
        uint256 _minimumDeposit,
        uint256 _withdrawalFeeBps,
        bool _yieldEnabled,
        address _treasury,
        uint256 _treasuryFeeBps
    ) {
        require(_token != address(0), "token 0");
        require(_members.length >= 2, "need >=2 members");
        require(_minimumDeposit > 0, "minimum 0");
        require(_treasury != address(0), "treasury 0");

        token = IERC20(_token);
        members = _members;
        totalMembers = _members.length;
        minimumDeposit = _minimumDeposit;
        withdrawalFeeBps = _withdrawalFeeBps;
        yieldEnabled = _yieldEnabled;
        treasury = _treasury;
        treasuryFeeBps = _treasuryFeeBps;
        active = true;
    }

    function deposit(uint256 amount) external {
        require(active, "pool inactive");
        require(isMember(msg.sender), "not member");
        require(amount >= minimumDeposit, "below minimum");

        bool ok = token.transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");

        balances[msg.sender] += amount;
        totalBalance += amount;

        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "amount 0");
        require(balances[msg.sender] >= amount, "insufficient balance");

        uint256 fee = (amount * withdrawalFeeBps) / BPS;
        uint256 netAmount = amount - fee;

        balances[msg.sender] -= amount;
        totalBalance -= amount;

        if (fee > 0) {
            bool feeOk = token.transfer(treasury, fee);
            require(feeOk, "fee transfer failed");
        }

        bool ok = token.transfer(msg.sender, netAmount);
        require(ok, "withdraw transfer failed");

        emit Withdrawn(msg.sender, netAmount, fee);
    }

    function distributeYield(uint256 yieldAmount) external onlyOwner {
        require(yieldEnabled, "yield disabled");
        require(yieldAmount > 0, "yield 0");
        require(totalBalance > 0, "no balance");

        for (uint256 i = 0; i < totalMembers; i++) {
            address member = members[i];
            if (balances[member] > 0) {
                uint256 memberYield = (yieldAmount * balances[member]) / totalBalance;
                balances[member] += memberYield;
            }
        }

        emit YieldDistributed(yieldAmount);
    }

    function isMember(address who) public view returns (bool) {
        for (uint256 i = 0; i < totalMembers; i++) {
            if (members[i] == who) return true;
        }
        return false;
    }

    function membersList() external view returns (address[] memory) {
        return members;
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}

/* ========== FACTORY ========== */
contract BaseSafeFactory {
    address public immutable token;
    address public treasury;
    address[] public allRotational;
    address[] public allTarget;
    address[] public allFlexible;
    address public owner;

    event RotationalCreated(address indexed pool, address indexed creator);
    event TargetCreated(address indexed pool, address indexed creator);
    event FlexibleCreated(address indexed pool, address indexed creator);

    constructor(address _token, address _treasury) {
        require(_token != address(0), "token 0");
        require(_treasury != address(0), "treasury 0");
        token = _token;
        treasury = _treasury;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    function createRotational(
        address[] calldata members,
        uint256 depositAmount,
        uint256 roundDuration,
        uint256 treasuryFeeBps,
        uint256 relayerFeeBps
    ) external returns (address) {
        BaseSafeRotational pool = new BaseSafeRotational(
            token, members, depositAmount, roundDuration, treasuryFeeBps, relayerFeeBps, treasury
        );
        pool.transferOwnership(msg.sender);
        allRotational.push(address(pool));
        emit RotationalCreated(address(pool), msg.sender);
        return address(pool);
    }

    function createTarget(address[] calldata members, uint256 targetAmount, uint256 deadline, uint256 treasuryFeeBps)
        external
        returns (address)
    {
        BaseSafeTarget pool = new BaseSafeTarget(token, members, targetAmount, deadline, treasuryFeeBps, treasury);
        pool.transferOwnership(msg.sender);
        allTarget.push(address(pool));
        emit TargetCreated(address(pool), msg.sender);
        return address(pool);
    }

    function createFlexible(
        address[] calldata members,
        uint256 minimumDeposit,
        uint256 withdrawalFeeBps,
        bool yieldEnabled,
        uint256 treasuryFeeBps
    ) external returns (address) {
        BaseSafeFlexible pool = new BaseSafeFlexible(
            token, members, minimumDeposit, withdrawalFeeBps, yieldEnabled, treasury, treasuryFeeBps
        );
        pool.transferOwnership(msg.sender);
        allFlexible.push(address(pool));
        emit FlexibleCreated(address(pool), msg.sender);
        return address(pool);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "treasury 0");
        treasury = _treasury;
    }
}
