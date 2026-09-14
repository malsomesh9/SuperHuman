import { GmailProvider, header, type GmailAccount, type GmailMessage } from "./provider";
import { checked, database, MailError } from "./server";

type HistoryPage = { historyId: string; nextPageToken?: string; history?: { messages?: { id: string }[]; messagesDeleted?: { message: { id: string } }[] }[] };

async function persist(account: GmailAccount, message: GmailMessage) {
  checked(await database().from("smartemail_gmail_messages").upsert([{
    user_id: account.user_id, account_id: account.id, gmail_id: message.id, thread_id: message.threadId,
    subject: header(message, "subject"), sender: header(message, "from"), snippet: message.snippet ?? "", labels: message.labelIds ?? [],
    internal_date: new Date(Number(message.internalDate ?? Date.now())).toISOString()
  }], { onConflict: "account_id,gmail_id" }));
}

export async function syncMailbox(account: GmailAccount) {
  const provider = new GmailProvider(account);
  let count = 0;
  let cursor = account.history_id;
  if (cursor) {
    let pageToken: string | undefined;
    try {
      for (let page = 0; page < 10; page++) {
        const params = new URLSearchParams({ startHistoryId: account.history_id!, maxResults: "100", ...(pageToken ? { pageToken } : {}) });
        const history = await provider.request<HistoryPage>(`history?${params}`);
        const deleted = new Set((history.history ?? []).flatMap(h => h.messagesDeleted?.map(d => d.message.id) ?? []));
        const ids = new Set((history.history ?? []).flatMap(h => h.messages?.map(m => m.id) ?? []));
        for (const id of ids) {
          try { await persist(account, await provider.message(id, "metadata")); count++; }
          catch (error) { if (error instanceof MailError && error.status === 404) deleted.add(id); else throw error; }
        }
        if (deleted.size) checked(await database().from("smartemail_gmail_messages").delete().eq("user_id", account.user_id).eq("account_id", account.id).in("gmail_id", [...deleted]));
        cursor = history.historyId; pageToken = history.nextPageToken;
        if (!pageToken) break;
      }
      if (pageToken) return { processed: count, complete: false };
    } catch (error) {
      if (!(error instanceof MailError && error.status === 404)) throw error;
      cursor = null;
    }
  }
  if (!cursor) {
    // Capture the baseline before fetching so mail arriving during import is replayed.
    const baseline = await provider.profile();
    const page = await provider.messages("newer_than:14d");
    for (const message of page.messages ?? []) { await persist(account, await provider.message(message.id, "metadata")); count++; }
    cursor = baseline.historyId;
  }
  checked(await database().from("smartemail_gmail_accounts").update({ history_id: cursor, last_sync_at: new Date().toISOString() }).eq("user_id", account.user_id).eq("id", account.id));
  return { processed: count, complete: true, scope: "incremental changes and recent mailbox preview; older messages load on demand" };
}
