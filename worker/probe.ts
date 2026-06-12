// One-shot probe: prints raw Composio responses so we can confirm
// field names before trusting the poller. Run: npm run probe
import "dotenv/config";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
  toolkitVersions: { facebook: "20260410_00" },
});
const userId = process.env.COMPOSIO_USER_ID!;

async function main() {
  console.log("=== CONNECTED ACCOUNTS (raw API, includes user_id) ===");
  const raw = await fetch("https://backend.composio.dev/api/v3/connected_accounts", {
    headers: { "x-api-key": process.env.COMPOSIO_API_KEY! },
  }).then((r) => r.json());
  for (const a of raw.items ?? []) {
    console.log(`toolkit=${a.toolkit?.slug}  user_id=${a.user_id}  status=${a.status}  id=${a.id}`);
  }
  console.log("\nSet COMPOSIO_USER_ID in .env to the facebook row's user_id above.\n");
  const accounts = await composio.connectedAccounts.list({});

  const connectedAccountId =
    process.env.COMPOSIO_CONNECTED_ACCOUNT_ID ??
    ((accounts as any).items ?? []).find(
      (a: any) => (a.toolkit?.slug ?? a.toolkitSlug) === "facebook",
    )?.id;
  console.log(`Using connectedAccountId: ${connectedAccountId}\n`);

  console.log("=== FACEBOOK_LIST_MANAGED_PAGES ===");
  const pages = await composio.tools.execute("FACEBOOK_LIST_MANAGED_PAGES", {
    userId,
    connectedAccountId,
    arguments: {},
  });
  console.log(JSON.stringify(pages, null, 2));

  const pageId = process.env.FB_PAGE_ID;
  if (!pageId) {
    console.log("\nSet FB_PAGE_ID in .env (from the output above) and re-run to probe conversations.");
    return;
  }

  console.log("\n=== FACEBOOK_GET_PAGE_CONVERSATIONS ===");
  const convos = await composio.tools.execute("FACEBOOK_GET_PAGE_CONVERSATIONS", {
    userId,
    connectedAccountId,
    arguments: { page_id: pageId },
  });
  console.log(JSON.stringify(convos, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
