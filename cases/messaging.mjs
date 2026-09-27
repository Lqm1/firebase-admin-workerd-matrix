import { getMessaging } from "firebase-admin/messaging";
import { expectEqual, withApp } from "./shared.mjs";

export async function runCase(id, token) {
  if (id === "messaging.import") {
    expectEqual(typeof getMessaging, "function");
    return;
  }
  if (id === "messaging.create") {
    await withApp(token, async (app) => {
      expectEqual(typeof getMessaging(app).send, "function");
    });
    return;
  }
  throw new Error(`Unknown case: ${id}`);
}
