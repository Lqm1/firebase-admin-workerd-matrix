import { getAuth } from "firebase-admin/auth";
import { initializeFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import { getStorage } from "firebase-admin/storage";
import { withApp } from "../cases/shared.mjs";

export async function prepare(caseId, token) {
  if (caseId.endsWith(".import") || caseId === "messaging.create") return;
  await withApp(`${token}-fixture`, async (app) => {
    if (caseId === "auth.get" || caseId === "auth.delete") {
      await getAuth(app).createUser({ uid: token });
    } else if (caseId === "firestore.read" || caseId === "firestore.delete") {
      await initializeFirestore(app, { preferRest: true }).collection("matrix").doc(token).set({ value: token });
    } else if (caseId === "database.read" || caseId === "database.delete") {
      await getDatabase(app).ref(`matrix/${token}`).set({ value: token });
    } else if (caseId === "storage.download" || caseId === "storage.delete") {
      await getStorage(app).bucket().file(`matrix/${token}`).save(`value:${token}`, { resumable: false });
    }
  });
}

export async function cleanup(caseId, token) {
  if (caseId.endsWith(".import") || caseId === "messaging.create") return;
  await withApp(`${token}-cleanup`, async (app) => {
    if (caseId.startsWith("auth.")) {
      try {
        await getAuth(app).deleteUser(token);
      } catch (error) {
        if (error?.code !== "auth/user-not-found") throw error;
      }
    } else if (caseId.startsWith("firestore.")) {
      await initializeFirestore(app, { preferRest: true }).collection("matrix").doc(token).delete();
    } else if (caseId.startsWith("database.")) {
      await getDatabase(app).ref(`matrix/${token}`).remove();
    } else if (caseId.startsWith("storage.")) {
      try {
        await getStorage(app).bucket().file(`matrix/${token}`).delete();
      } catch (error) {
        if (error?.code !== 404) throw error;
      }
    }
  });
}
