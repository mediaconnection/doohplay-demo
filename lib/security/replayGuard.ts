// @ts-nocheck
const seen = new Set<string>();

export function checkReplay(hash: string) {
  if (seen.has(hash)) {
    return true;
  }

  seen.add(hash);

  setTimeout(() => seen.delete(hash), 60000);

  return false;
}
