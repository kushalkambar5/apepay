// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PoolVault - ApePay zkBob-style Privacy Pool
contract PoolVault {
    address public immutable operator;

    event Deposited(bytes32 indexed paymentId, address indexed sender, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount, bytes32 indexed ref);

    error NotOperator();
    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();

    modifier onlyOperator() {
        if (msg.sender != operator) revert NotOperator();
        _;
    }

    constructor(address _operator) {
        require(_operator != address(0), "PoolVault: zero operator");
        operator = _operator;
    }

    /// @notice Customer deposits ETH with paymentId
    function deposit(bytes32 paymentId) external payable {
        if (msg.value == 0) revert ZeroAmount();
        emit Deposited(paymentId, msg.sender, msg.value);
    }

    /// @notice Operator withdraws ETH to merchant payout wallet
    function withdraw(address payable recipient, uint256 amount, bytes32 ref) external onlyOperator {
        if (amount == 0) revert ZeroAmount();
        if (address(this).balance < amount) revert InsufficientBalance();
        (bool ok, ) = recipient.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(recipient, amount, ref);
    }

    function poolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}