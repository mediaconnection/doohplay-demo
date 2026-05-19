const crypto = require("crypto");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

const payload = JSON.stringify({
  campaign_id: "test",
  player_id: "player1",
  timestamp: new Date().toISOString()
});

const eventHash = sha256(payload);

console.log("Payload:");
console.log(payload);

console.log("\nEvent Hash:");
console.log(eventHash);