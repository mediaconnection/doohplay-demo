const { ethers } = require("ethers");

/**
 * Inicializa provider blockchain
 */
function getProvider() {

  const rpc =
    process.env.BLOCKCHAIN_RPC ||
    "https://polygon-rpc.com";

  return new ethers.JsonRpcProvider(rpc);
}

/**
 * Inicializa carteira
 */
function getWallet() {

  const privateKey =
    process.env.BLOCKCHAIN_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY não definido");
  }

  const provider = getProvider();

  return new ethers.Wallet(privateKey, provider);
}

/**
 * Envia Merkle Root para blockchain
 */
async function anchorMerkleRoot(merkleRoot) {

  if (!merkleRoot) {
    throw new Error("Merkle root inválido");
  }

  const wallet = getWallet();

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0,
    data: ethers.hexlify(
      ethers.toUtf8Bytes(merkleRoot)
    )
  });

  const receipt = await tx.wait();

  return {
    tx_hash: tx.hash,
    block_number: receipt.blockNumber,
    network: await wallet.provider.getNetwork()
  };
}

/**
 * Monta URL de explorador
 */
function getExplorerUrl(txHash) {

  const explorer =
    process.env.BLOCKCHAIN_EXPLORER ||
    "https://polygonscan.com/tx/";

  return explorer + txHash;
}

module.exports = {
  anchorMerkleRoot,
  getExplorerUrl
};