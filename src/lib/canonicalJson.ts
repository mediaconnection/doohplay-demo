// Canonical JSON (ordena chaves recursivamente)
export function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalize).join(",")}]`;
  }

  const keys = Object.keys(obj).sort();
  const entries = keys.map(
    (key) => `${JSON.stringify(key)}:${canonicalize(obj[key])}`
  );

  return `{${entries.join(",")}}`;
}