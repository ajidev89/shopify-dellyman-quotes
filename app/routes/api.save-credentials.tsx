import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import Credential from "model/credentials";

export async function loader({ request }: any) {
  const url = new URL(request.url);
  const store_id = url.searchParams.get("store_id");

  if (!store_id) {
    return json({ error: "store_id is required" }, { status: 400 });
  }

  const details = await Credential.findOne({ store_id });
  return json({ details });
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const { api_key, webhook_secret, store_id, webhook_url } =
      await request.json();

    if (!api_key || !webhook_secret) {
      return json(
        { error: "API Key and Webhook Secret are required" },
        { status: 400 },
      );
    }
    const details = await Credential.findOneAndUpdate(
      { store_id }, // Search by store_id
      {
        api_key,
        webhook_secret,
        webhook_url,
      },
      { upsert: true, new: true }, // Create if not exists, return updated document
    );
    return json({
      success: true,
      message: "Credentials saved successfully",
      data: details,
    });
  } catch (error) {
    console.error("Error saving credentials:", error);
    return json({ error }, { status: 500 });
  }

  return json({ success: true, message: "Credentials saved successfully" });
};
