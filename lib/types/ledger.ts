/**
 * DOOHPLAY Ledger Types
 * Centralized type definitions for the cryptographic ledger
 */

/* ======================================================
   Ledger Event
====================================================== */

export type LedgerEvent = {

  event_id: string;

  event_type: string;

  payload: unknown;

  event_hash: string | null;

  previous_hash: string | null;

  merkle_root: string | null;

  signature: string | null;

  block_height: number | null;

  occurred_at: string | Date | null;

};

/* ======================================================
   Ledger Block
====================================================== */

export type LedgerBlock = {

  block_height: number;

  block_hash: string;

  previous_hash: string | null;

  merkle_root: string;

  event_count?: number;

  created_at?: string | Date;

};

/* ======================================================
   Merkle Proof
====================================================== */

export type MerkleProofStep = {

  hash: string;

  position: "left" | "right";

};

export type MerkleProof = MerkleProofStep[];

/* ======================================================
   Cryptographic Verification
====================================================== */

export type LedgerVerification = {

  event_hash_valid: boolean;

  merkle_valid?: boolean;

  block_valid?: boolean;

  chain_valid?: boolean;

  signature_valid?: boolean;

  valid: boolean;

};

/* ======================================================
   Ledger Search Result
====================================================== */

export type LedgerSearchResult = {

  events?: LedgerEvent[];

  blocks?: LedgerBlock[];

};

/* ======================================================
   Proof Certificate
====================================================== */

export type LedgerProofCertificate = {

  event_id: string;

  event_hash: string;

  block_height?: number;

  block_hash?: string;

  merkle_root?: string;

  signature?: string;

  timestamp?: string | Date;

};

/* ======================================================
   Ledger API Responses
====================================================== */

export type LedgerEventResponse = {

  event: LedgerEvent;

  verification?: LedgerVerification;

};

export type LedgerBlockResponse = {

  block: LedgerBlock;

  events?: LedgerEvent[];

};

/* ======================================================
   Ledger Chain
====================================================== */

export type LedgerChain = {

  blocks: LedgerBlock[];

};