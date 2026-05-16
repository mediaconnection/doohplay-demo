export class VerificationError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = "VerificationError"
  }
}

export const PROOF_NOT_FOUND = "PROOF_NOT_FOUND"
export const VERIFICATION_FAILED = "VERIFICATION_FAILED"
export const INVALID_HASH = "INVALID_HASH"
