import JSZip from "jszip";

export async function zipProofPackage(
  files: Record<string, Buffer | string>
) {
  const zip = new JSZip();

  for (const [name, content] of Object.entries(files)) {
    zip.file(name, content);
  }

  return zip.generateAsync({ type: "nodebuffer" });
}