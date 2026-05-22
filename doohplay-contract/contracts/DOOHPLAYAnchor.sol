// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DOOHPLAYAnchor {
    mapping(bytes32 => bool) public roots;

    event RootAnchored(bytes32 indexed root, address indexed sender);

    function storeRoot(bytes32 root) external {
        require(root != bytes32(0), "Invalid root");
        require(!roots[root], "Root already anchored");

        roots[root] = true;

        emit RootAnchored(root, msg.sender);
    }

    function anchorMerkle(bytes32 root) external {
        require(root != bytes32(0), "Invalid root");
        require(!roots[root], "Root already anchored");

        roots[root] = true;

        emit RootAnchored(root, msg.sender);
    }
}