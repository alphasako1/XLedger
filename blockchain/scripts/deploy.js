const hre = require("hardhat");

async function main() {
  const CaseFactory = await hre.ethers.getContractFactory("CaseFactory");
  console.log("Deploying CaseFactory...");
  const factory = await CaseFactory.deploy();
  console.log("CaseFactory deployed to:", factory.target); // Ethers v6 uses .target instead of .address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
