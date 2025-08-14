require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.8.28" }
    ]
  },
  networks: {
    sepolia: {
      url: process.env.WEB3_PROVIDER,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
