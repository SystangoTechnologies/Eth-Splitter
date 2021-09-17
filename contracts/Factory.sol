// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Splitter.sol";

contract Factory {
    address[] public contracts;
    event SplitterCreated(address indexed contractAddress);

    function getContractCount() public view returns (uint256) {
        return contracts.length;
    }

    function registerContract(
        address owner,
        address payable[] memory payeeAddresses,
        uint256[] memory payeeShare
    ) public {
        Splitter splitter = new Splitter(false, payeeAddresses, payeeShare);
        contracts.push(address(splitter));
        splitter.transferOwnership(owner);
        emit SplitterCreated(address(splitter));
    }
}
