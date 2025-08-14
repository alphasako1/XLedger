// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CaseContract {
    string public caseId;
    bytes32 public finalHash;
    bool public isClosed;

    bytes32 public lawyer;
    bytes32 public client;

    struct LogEntry {
        bytes32 logHash;
        uint256 timestamp;
        uint256 version; // NEW: version number
        uint256 parentLogIndex; // NEW: link to original log
    }

    struct StatusChange {
        bytes32 statusHash;
        uint256 timestamp;
    }

    LogEntry[] public logs;
    StatusChange[] public statusHistory;

    event LogAdded(bytes32 logHash, uint256 timestamp, uint256 version, uint256 parentLogIndex);
    event CaseClosed(string caseId, bytes32 finalHash, uint256 timestamp);
    event StatusUpdated(bytes32 statusHash, uint256 timestamp);

    modifier notClosed() {
        require(!isClosed, "Case is closed");
        _;
    }

    constructor(string memory _caseId, bytes32 _lawyer, bytes32 _client) {
        caseId = _caseId;
        lawyer = _lawyer;
        client = _client;
    }

    // Add a new log (version 1)
    function addLog(bytes32 logHash) external notClosed {
        logs.push(LogEntry(logHash, block.timestamp, 1, 0)); 
        emit LogAdded(logHash, block.timestamp, 1, 0);
    }

    // Add a new version of an existing log
    function addLogVersion(uint256 parentIndex, bytes32 newLogHash) external notClosed {
        require(parentIndex < logs.length, "Invalid parent log index");
        uint256 newVersion = logs[parentIndex].version + 1;
        logs.push(LogEntry(newLogHash, block.timestamp, newVersion, parentIndex));
        emit LogAdded(newLogHash, block.timestamp, newVersion, parentIndex);
    }

    function finalizeCase(bytes32 hash) external notClosed {
        finalHash = hash;
        isClosed = true;
        emit CaseClosed(caseId, hash, block.timestamp);
    }

    function updateStatus(bytes32 statusHash) external notClosed {
        statusHistory.push(StatusChange(statusHash, block.timestamp));
        emit StatusUpdated(statusHash, block.timestamp);
    }

    function getLog(uint256 index) external view returns (bytes32, uint256, uint256, uint256) {
        LogEntry memory log = logs[index];
        return (log.logHash, log.timestamp, log.version, log.parentLogIndex);
    }

    function getLogCount() external view returns (uint256) {
        return logs.length;
    }

    function getStatus(uint256 index) external view returns (bytes32, uint256) {
        StatusChange memory s = statusHistory[index];
        return (s.statusHash, s.timestamp);
    }

    function getStatusCount() external view returns (uint256) {
        return statusHistory.length;
    }
}
