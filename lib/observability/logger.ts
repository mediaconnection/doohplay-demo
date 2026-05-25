// @ts-nocheck
export function log(event: string, data: any) {
  console.log(JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    ...data
  }))
}
