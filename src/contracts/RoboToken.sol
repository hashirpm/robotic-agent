// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract RoboToken is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("ROBO Token", "ROBO") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Initial supply of 1 million tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
       // Burn tokens (anyone can burn their own tokens)
    function burn(uint256 amount) public override {
        _burn(_msgSender(), amount);
    }
}
