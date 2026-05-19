const hre = require("hardhat")

async function main() {
  const Factory = await hre.ethers.getContractFactory("DOOHPLAYAnchor")

  console.log("🚀 Deploying DOOHPLAYAnchor...")

  const contract = await Factory.deploy()

  await contract.waitForDeployment()

  const address = await contract.getAddress()

  console.log("✅ Contract deployed at:", address)
}

main().catch((error) => {
  console.error("❌ Deploy failed:", error)
  process.exitCode = 1
})