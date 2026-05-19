"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Block = {
  block_height: number;
  block_hash: string;
  previous_hash: string | null;
  created_at: string;
};

function shortHash(hash?: string | null) {
  if (!hash) return "-";
  return hash.slice(0, 12) + "...";
}

export default function LedgerGraph() {

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function load() {

      try {

        const res = await fetch("/api/ledger/blocks");

        const data = await res.json();

        setBlocks(data);

      } catch (err) {

        console.error("Ledger graph load error", err);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  if (loading) {
    return <div>Loading ledger graph...</div>;
  }

  if (!blocks.length) {
    return <div>No blocks found.</div>;
  }

  return (
    <div style={{ marginTop: 30 }}>

      {blocks.map((block, index) => {

        const date = new Date(block.created_at);

        return (
          <div key={block.block_height}>

            <div
              style={{
                border: "1px solid #ddd",
                padding: 15,
                borderRadius: 6,
                marginBottom: 10,
                background: "#fafafa"
              }}
            >

              <div style={{ fontWeight: "bold" }}>
                Block #{block.block_height}
              </div>

              <div style={{ fontSize: 12 }}>
                {date.toLocaleString()}
              </div>

              <div style={{ marginTop: 10 }}>
                <b>Hash</b>
              </div>

              <code>{shortHash(block.block_hash)}</code>

              <div style={{ marginTop: 10 }}>
                <Link href={`/ledger/block/${block.block_height}`}>
                  Open block
                </Link>
              </div>

            </div>

            {index < blocks.length - 1 && (

              <div
                style={{
                  textAlign: "center",
                  marginBottom: 10,
                  fontSize: 20
                }}
              >
                ↓
              </div>

            )}

          </div>
        );

      })}

    </div>
  );

}