//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./SafeMath.sol";
import "./Killable.sol";

contract Splitter is Killable {
    struct Payee {
        address payable payeeAddress;
        uint256 share;
    }

    Payee[] public payees;

    event ReceivedEth(address indexed fromAddress, uint256 amount);
    event SplittedEth(uint256 amount, Payee[] payees);

    using SafeMath for uint256;

    constructor(
        bool _paused,
        address payable[] memory payeeAddresses,
        uint256[] memory payeeShare
    ) Pausable(_paused) {
        sanityCheck(payeeAddresses, payeeShare);
        for (uint256 i = 0; i < payeeAddresses.length; i++) {
            Payee memory payee = Payee(payeeAddresses[i], payeeShare[i]);
            payees.push(payee);
        }
    }

    function sanityCheck(
        address payable[] memory payeeAddresses,
        uint256[] memory payeeShares
    ) internal pure {
        uint256 length = payeeAddresses.length;
        require(
            length == payeeShares.length,
            "Mismatch between payees and share arrays"
        );

        uint256 shareSum;
        for (uint256 i; i < payeeShares.length; i++) {
            shareSum += payeeShares[i];
        }
        require(shareSum <= 100, "The sum of payee share cannot exceed 100%");
    }

    receive() external payable whenRunning whenAlive {
        emit ReceivedEth(msg.sender, msg.value);
        require(msg.value > 0, "Fund value 0 is not allowed");
        split(msg.value);
    }

    function split(uint256 amount) internal {
        for (uint256 i = 0; i < payees.length; i++) {
            address payable payee = payees[i].payeeAddress;
            payee.transfer(amount.div(100).mul(payees[i].share)); // transfer percentage share
        }
        emit SplittedEth(amount, payees);
    }
}
