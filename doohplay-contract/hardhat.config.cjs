require("dotenv").config({ path: ".env", override: true })
require("@nomicfoundation/hardhat-ethers")

const privateKey = process.env.PRIVATE_KEY || ""

const accounts =
  /^0x[a-fA-F0-9]{64}$/.test(privateKey)
    ? [privateKey]
    : []

const rpcCandidates = [
  process.env.POLYGON_RPC,
  "https://polygon.drpc.org",
  "https://polygon.publicnode.com",
  "https://1rpc.io/matic",
  "https://polygon.api.onfinality.io/public"
].filter(Boolean)

module.exports = {
  solidity: "0.8.20",
  networks: {
    polygon: {
      url: rpcCandidates[0],
      accounts
    }
  }
}