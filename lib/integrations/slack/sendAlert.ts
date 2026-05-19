export async function sendSlackAlert(message: string) {
  const webhook = process.env.SLACK_WEBHOOK_URL

  if (!webhook) return

  try {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: message
      })
    })
  } catch (err) {
    console.error("Slack error:", err)
  }
}