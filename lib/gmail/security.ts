import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export function encryptionKey() {
  const value = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new Error("Gmail credential encryption is not configured.");
  return Buffer.from(value, "hex");
}

export function seal(value: string, owner: string) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), nonce);
  cipher.setAAD(Buffer.from(owner));
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return ["v1", nonce.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function unseal(value: string, owner: string) {
  const [version, nonce, tag, data, extra] = value.split(".");
  if (version !== "v1" || !nonce || !tag || !data || extra) throw new Error("Invalid encrypted credential.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(nonce, "base64url"));
  decipher.setAAD(Buffer.from(owner));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
