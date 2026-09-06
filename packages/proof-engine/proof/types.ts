// @ts-nocheck
export type {
  EntityType,
  FailureReason,
  LayerResult,
  ProofInput,
  ProofMeta,
  ProofResultLike,
  TrustLevel,
  VerificationStatus,
} from "../../../lib/proof/types"

export interface CertificateChainResult {
  valid: boolean;
  chain?: string[];
  error?: string;
}

export interface RevocationResult {
  valid: boolean;
  method: "OCSP" | "CRL" | "NONE";
  error?: string;
}

export interface SignatureValidationResult {
  valid: boolean;
  signer?: string;
  authority?: string;
  signedAt?: string;

  chain?: CertificateChainResult;
  revocation?: RevocationResult;

  error?: string;
}
