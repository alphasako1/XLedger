// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./CaseContract.sol";

contract CaseFactory {
    address public owner;
    mapping(string => address) public caseContracts;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCase(string calldata caseId, bytes32 lawyer, bytes32 client) external onlyOwner returns (address) {
        require(caseContracts[caseId] == address(0), "Case already exists");
        CaseContract newCase = new CaseContract(caseId, lawyer, client);
        caseContracts[caseId] = address(newCase);
        return address(newCase);
    }

    function getCaseAddress(string calldata caseId) external view returns (address) {
        return caseContracts[caseId];
    }
}

