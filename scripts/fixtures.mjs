import { getAuth } from "firebase-admin/auth";
import { initializeFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import { getStorage } from "firebase-admin/storage";
import { withApp } from "../cases/shared.mjs";

export async function prepare(caseId, token) {
  if (caseId.endsWith(".import") || caseId === "messaging.create") return;
  let input;
  await withApp(`${token}-fixture`, async (app) => {
    if (caseId === "auth.getByProvider") {
      const result = await getAuth(app).importUsers([{ uid: token, providerData: [{ providerId: "google.com", uid: `provider-${token}` }] }]);
      if (result.failureCount) throw new Error(`Provider fixture import failed: ${JSON.stringify(result.errors)}`);
    } else if (["auth.get", "auth.delete", "auth.getByEmail", "auth.getByPhone", "auth.getMany", "auth.list", "auth.update", "auth.deleteMany", "auth.setClaims", "auth.revoke", "auth.verifyIdToken", "auth.createSessionCookie", "auth.verifySessionCookie", "auth.passwordResetLink", "auth.emailVerificationLink", "auth.verifyAndChangeEmailLink"].includes(caseId)) {
      const properties = { uid: token, email: `${token}@example.test`, phoneNumber: "+15555550123" };
      if (["auth.verifyIdToken", "auth.createSessionCookie", "auth.verifySessionCookie"].includes(caseId)) {
        properties.password = "matrix-password-123";
      }
      await getAuth(app).createUser(properties);
      if (properties.password) {
        const response = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=matrix", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: properties.email, password: properties.password, returnSecureToken: true }),
        });
        const body = await response.json();
        if (!response.ok || typeof body.idToken !== "string") throw new Error(`Auth emulator token fixture failed: ${JSON.stringify(body)}`);
        input = body.idToken;
      }
    } else if (caseId === "firestore.read" || caseId === "firestore.delete") {
      await initializeFirestore(app, { preferRest: true }).collection("matrix").doc(token).set({ value: token });
    } else if (caseId === "database.read" || caseId === "database.delete") {
      await getDatabase(app).ref(`matrix/${token}`).set({ value: token });
    } else if (caseId === "database.query") {
      await getDatabase(app).ref(`matrix/${token}`).set({ a: { value: token }, b: { value: "other" } });
    } else if (caseId === "database.transaction") {
      await getDatabase(app).ref(`matrix/${token}`).set({ count: 1 });
    } else if (["storage.download", "storage.delete", "storage.metadata", "storage.list", "storage.copy"].includes(caseId)) {
      await getStorage(app).bucket().file(`matrix/${token}`).save(`value:${token}`, { resumable: false });
    }
  });
  return input;
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
      if (caseId === "storage.copy") {
        try {
          await getStorage(app).bucket().file(`matrix/${token}-copy`).delete();
        } catch (error) {
          if (error?.code !== 404) throw error;
        }
      }
    }
  });
}
