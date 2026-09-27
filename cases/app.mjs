import * as admin from "firebase-admin";

export async function runCase(id) {
  if (id !== "app.import") throw new Error(`Unknown case: ${id}`);
  if (typeof admin.initializeApp !== "function") {
    throw new Error("firebase-admin root does not export initializeApp");
  }
}
