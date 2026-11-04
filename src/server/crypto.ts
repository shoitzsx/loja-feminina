import crypto from "node:crypto";

function getKey(): Buffer | null {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  return key.length === 32 ? key : null;
}

/** Cifra um campo pessoal (AES-256-GCM). Sem chave válida devolve null: nunca grava em claro. */
export function encryptField(plain: string): string | null {
  const key = getKey();
  if (!key) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

/** Decifra; lança erro se a chave faltar ou o dado tiver sido adulterado. */
export function decryptField(payload: string): string {
  const key = getKey();
  if (!key) throw new Error("DATA_ENCRYPTION_KEY ausente ou inválida");
  const data = Buffer.from(payload, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8");
}
