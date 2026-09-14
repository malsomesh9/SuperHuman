import addressparser from "nodemailer/lib/addressparser/index.js";
import { header, type GmailMessage } from "./provider";

export function replyRecipients(message: GmailMessage, ownEmail: string) {
  const parse = (name: string) => addressparser(header(message, name), { flatten: true }).map(a => a.address).filter((a): a is string => Boolean(a));
  const unique = (addresses: string[]) => [...new Map(addresses.filter(a => a && a.toLowerCase() !== ownEmail.toLowerCase()).map(a => [a.toLowerCase(), a])).values()];
  let replyTo = unique(parse("reply-to").length ? parse("reply-to") : parse("from"));
  if (!replyTo.length) replyTo = unique(parse("to"));
  const replyAllTo = unique([...replyTo, ...parse("to")]);
  const toKeys = new Set(replyAllTo.map(a => a.toLowerCase()));
  const replyAllCc = unique(parse("cc")).filter(a => !toKeys.has(a.toLowerCase()));
  return { replyTo, replyAllTo, replyAllCc };
}
