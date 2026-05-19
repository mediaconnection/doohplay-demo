// services/anchor.ts

import { pool } from "@/lib/db"

export async function anchorMerkleRoot(root:string){

  await pool.query(`
    INSERT INTO anchors (
      merkle_root,
      anchored_at
    )
    VALUES ($1, NOW())
  `,[root])
}