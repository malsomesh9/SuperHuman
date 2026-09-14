import { z } from "zod";
import { ownedAccount } from "@/lib/gmail/provider";
import { failure, requireUser, sameOrigin, success } from "@/lib/gmail/server";
import { syncMailbox } from "@/lib/gmail/sync";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const { accountId } = z.object({ accountId: z.uuid() }).parse(await request.json());
    return success(await syncMailbox(await ownedAccount(user.id, accountId)));
  } catch (error) { return failure(error); }
}
