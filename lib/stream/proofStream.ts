import { proofStream } from "./streamEmitter"

export function publishProofEvent(type: string, payload: any) {

  proofStream.emit("proof-event", {
    type,
    payload,
    timestamp: new Date().toISOString()
  })

}