import { initializeFirestore } from "firebase-admin/firestore";
import { expectEqual, withApp } from "./shared.mjs";

export async function runCase(id, token) {
  if (id === "firestore.import") {
    expectEqual(typeof initializeFirestore, "function");
    return;
  }
  await withApp(token, async (app) => {
    const doc = initializeFirestore(app, { preferRest: true }).collection("matrix").doc(token);
    if (id === "firestore.write") {
      await doc.set({ value: token });
    } else if (id === "firestore.read") {
      const snapshot = await doc.get();
      expectEqual(snapshot.data()?.value, token);
    } else if (id === "firestore.delete") {
      await doc.delete();
    } else {
      throw new Error(`Unknown case: ${id}`);
    }
  });
}
