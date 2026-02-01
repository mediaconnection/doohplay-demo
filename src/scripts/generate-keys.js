const crypto = require("crypto");

const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
});

console.log("PRIVATE KEY:\n");
console.log(privateKey.export({ type: "pkcs8", format: "pem" }));

console.log("\nPUBLIC KEY:\n");
console.log(publicKey.export({ type: "spki", format: "pem" }));
