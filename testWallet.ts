import { Wallet } from "ethers"
import dotenv from "dotenv"

dotenv.config()

const pk = process.env.WALLET_PRIVATE_KEY!

const wallet = new Wallet(pk)

console.log("Address:", wallet.address)