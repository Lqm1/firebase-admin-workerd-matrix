import { getDatabase } from "firebase-admin/database";
import { expectEqual, withApp } from "./shared.mjs";

export async function runCase(id, token) {
  if (id === "database.import") {
    expectEqual(typeof getDatabase, "function");
    return;
  }
  await withApp(token, async (app) => {
    const ref = getDatabase(app).ref(`matrix/${token}`);
    if (id === "database.write") {
      await ref.set({ value: token });
    } else if (id === "database.read") {
      const snapshot = await ref.get();
      expectEqual(snapshot.val()?.value, token);
    } else if (id === "database.delete") {
      await ref.remove();
    } else {
      throw new Error(`Unknown case: ${id}`);
    }
  });
}
