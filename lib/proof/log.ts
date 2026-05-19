import crypto from "crypto";

export function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

export function buildLogEntryHash(data: string) {

  return sha256(`ENTRY:${data}`);

}

export function buildTreeRoot(entries: string[]) {

  if (entries.length === 0) return null;

  let level = entries.map(e => sha256(e));

  while (level.length > 1) {

    const next: string[] = [];

    for (let i = 0; i < level.length; i += 2) {

      const left = level[i];
      const right = level[i + 1] ?? left;

      next.push(sha256(left + right));

    }

    level = next;

  }

  return level[0];

}