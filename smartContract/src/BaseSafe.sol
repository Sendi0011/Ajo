// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/* ========== EMERGENCY WITHDRAWAL MODULE ========== */
abstract contract EmergencyWithdrawable {
    struct EmergencyRequest {
        address requester;
        uint256 amount;
        string reason;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        bool executed;
        bool rejected;
        uint256 createdAt;
        uint256 votingDeadline;
    }

    mapping(uint256 => EmergencyRequest) public emergencyRequests;
    uint256 public emergencyRequestCount;
    mapping(address => uint256) public emergencyUsageCount;
    
    uint256 public constant EMERGENCY_PENALTY_BPS = 1000; // 10%
    uint256 public constant VOTING_PERIOD = 2 days;
    uint256 private constant BPS = 10000;

    event EmergencyRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint256 amount,
        string reason,
        uint256 deadline
    );
    event EmergencyVoted(
        uint256 indexed requestId,
        address indexed voter,
        bool support
    );
    event EmergencyExecuted(
        uint256 indexed requestId,
        address indexed requester,
        uint256 amount,
        uint256 penalty
    );
    event EmergencyRejected(uint256 indexed requestId);

    function _isMember(address who) internal view virtual returns (bool);
    function _getTotalMembers() internal view virtual returns (uint256);
    function _getToken() internal view virtual returns (IERC20);
    function _getTreasury() internal view virtual returns (address);

    function requestEmergencyWithdrawal(uint256 amount, string calldata reason) external {
        require(_isMember(msg.sender), "not member");
        require(amount > 0, "amount 0");
        require(bytes(reason).length > 0, "reason required");
        require(bytes(reason).length <= 500, "reason too long");

        uint256 requestId = emergencyRequestCount++;
        EmergencyRequest storage req = emergencyRequests[requestId];
        
        req.requester = msg.sender;
        req.amount = amount;
        req.reason = reason;
        req.votesFor = 0;
        req.votesAgainst = 0;
        req.executed = false;
        req.rejected = false;
        req.createdAt = block.timestamp;
        req.votingDeadline = block.timestamp + VOTING_PERIOD;

        emit EmergencyRequested(requestId, msg.sender, amount, reason, req.votingDeadline);
    }

    function voteOnEmergencyRequest(uint256 requestId, bool support) external {
        require(_isMember(msg.sender), "not member");
        
        EmergencyRequest storage req = emergencyRequests[requestId];
        require(!req.executed, "already executed");
        require(!req.rejected, "already rejected");
        require(block.timestamp <= req.votingDeadline, "voting ended");
        require(!req.hasVoted[msg.sender], "already voted");
        require(req.requester != msg.sender, "cannot vote own request");

        req.hasVoted[msg.sender] = true;

        if (support) {
            req.votesFor++;
        } else {
            req.votesAgainst++;
        }

        emit EmergencyVoted(requestId, msg.sender, support);

        // Auto-execute if majority reached
        _tryExecuteRequest(requestId);
    }

    function executeEmergencyRequest(uint256 requestId) external {
        _tryExecuteRequest(requestId);
    }

    function _tryExecuteRequest(uint256 requestId) internal {
        EmergencyRequest storage req = emergencyRequests[requestId];
        
        require(!req.executed, "already executed");
        require(!req.rejected, "already rejected");

        uint256 totalMembers = _getTotalMembers();
        uint256 requiredVotes = (totalMembers - 1) / 2 + 1; // Simple majority of other members

        // Check if voting period ended
        if (block.timestamp > req.votingDeadline) {
            if (req.votesFor < requiredVotes) {
                req.rejected = true;
                emit EmergencyRejected(requestId);
                return;
            }
        } else {
            // During voting period, only execute if majority reached
            if (req.votesFor < requiredVotes) {
                return;
            }
        }

        // Execute withdrawal with penalty
        uint256 penalty = (req.amount * EMERGENCY_PENALTY_BPS) / BPS;
        uint256 netAmount = req.amount - penalty;

        req.executed = true;
        emergencyUsageCount[req.requester]++;

        IERC20 token = _getToken();
        address treasury = _getTreasury();

        // Transfer penalty to treasury
        if (penalty > 0) {
            require(token.transfer(treasury, penalty), "penalty transfer failed");
        }

        // Transfer net amount to requester
        require(token.transfer(req.requester, netAmount), "withdrawal failed");

        emit EmergencyExecuted(requestId, req.requester, netAmount, penalty);
    }

    function getEmergencyRequest(uint256 requestId) 
        external 
        view 
        returns (
            address requester,
            uint256 amount,
            string memory reason,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed,
            bool rejected,
            uint256 createdAt,
            uint256 votingDeadline
        ) 
    {
        EmergencyRequest storage req = emergencyRequests[requestId];
        return (
            req.requester,
            req.amount,
            req.reason,
            req.votesFor,
            req.votesAgainst,
            req.executed,
            req.rejected,
            req.createdAt,
            req.votingDeadline
        );
    }

    function hasVotedOnRequest(uint256 requestId, address voter) external view returns (bool) {
        return emergencyRequests[requestId].hasVoted[voter];
    }
}

