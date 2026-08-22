import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SendEmailAttachment } from "@/lib/email/types";

/** Lee un archivo de /public y lo prepara como adjunto inline (CID) para Resend. */
export async function loadPublicAttachment(
  publicPath: string,
  contentId: string,
): Promise<SendEmailAttachment> {
  const relativePath = publicPath.replace(/^\//, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  const content = await readFile(absolutePath);

  return {
    filename: path.basename(absolutePath),
    content,
    contentId,
  };
}
