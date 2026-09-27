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
    } else if (id === "database.update") {
      await ref.update({ updated: true });
      expectEqual((await ref.get()).val()?.updated, true);
    } else if (id === "database.query") {
      const snapshot = await ref.orderByKey().limitToFirst(1).get();
      expectEqual(snapshot.val()?.a?.value, token);
      if (snapshot.val()?.b) throw new Error("Query returned more than one child");
    } else if (id === "database.transaction") {
      const result = await ref.transaction((value) => ({ count: (value?.count ?? 0) + 1 }));
      expectEqual(result.committed, true);
      expectEqual(result.snapshot.val()?.count, 2);
    } else {
      throw new Error(`Unknown case: ${id}`);
    }
  });
}
