import { getAuth } from "firebase-admin/auth";
import { expectEqual, withApp } from "./shared.mjs";

export async function runCase(id, token, input) {
  if (id === "auth.import") {
    expectEqual(typeof getAuth, "function");
    return;
  }
  await withApp(token, async (app) => {
    const auth = getAuth(app);
    if (id === "auth.create") {
      const user = await auth.createUser({ uid: token });
      expectEqual(user.uid, token);
    } else if (id === "auth.get") {
      const user = await auth.getUser(token);
      expectEqual(user.uid, token);
    } else if (id === "auth.delete") {
      await auth.deleteUser(token);
    } else if (id === "auth.getByEmail") {
      expectEqual((await auth.getUserByEmail(`${token}@example.test`)).uid, token);
    } else if (id === "auth.getByPhone") {
      expectEqual((await auth.getUserByPhoneNumber("+15555550123")).uid, token);
    } else if (id === "auth.getMany") {
      const users = await auth.getUsers([{ uid: token }]);
      expectEqual(users.users.length, 1);
      expectEqual(users.users[0].uid, token);
    } else if (id === "auth.list") {
      const users = await auth.listUsers(1000);
      if (!users.users.some((user) => user.uid === token)) throw new Error(`Listed users do not include ${token}`);
    } else if (id === "auth.update") {
      const user = await auth.updateUser(token, { displayName: "Matrix test" });
      expectEqual(user.displayName, "Matrix test");
    } else if (id === "auth.deleteMany") {
      const result = await auth.deleteUsers([token]);
      expectEqual(result.successCount, 1);
      expectEqual(result.failureCount, 0);
    } else if (id === "auth.setClaims") {
      await auth.setCustomUserClaims(token, { matrix: true });
      expectEqual((await auth.getUser(token)).customClaims.matrix, true);
    } else if (id === "auth.revoke") {
      await auth.revokeRefreshTokens(token);
      if (!Number.isFinite(new Date((await auth.getUser(token)).tokensValidAfterTime).getTime())) {
        throw new Error("tokensValidAfterTime is missing or invalid");
      }
    } else if (id === "auth.importUsers") {
      const result = await auth.importUsers([{ uid: token, email: `${token}@example.test` }]);
      expectEqual(result.successCount, 1);
      expectEqual(result.failureCount, 0);
    } else if (id === "auth.createCustomToken") {
      const jwt = await auth.createCustomToken(token, { matrix: true });
      expectEqual(jwt.split(".").length, 3);
    } else if (id === "auth.verifyIdToken") {
      if (!input) throw new Error("Missing ID token fixture");
      expectEqual((await auth.verifyIdToken(input)).uid, token);
    } else if (id === "auth.createSessionCookie") {
      if (!input) throw new Error("Missing ID token fixture");
      const cookie = await auth.createSessionCookie(input, { expiresIn: 3600000 });
      expectEqual(cookie.split(".").length, 3);
    } else if (id === "auth.verifySessionCookie") {
      if (!input) throw new Error("Missing ID token fixture");
      const cookie = await auth.createSessionCookie(input, { expiresIn: 3600000 });
      expectEqual((await auth.verifySessionCookie(cookie)).uid, token);
    } else if (id === "auth.getByProvider") {
      expectEqual((await auth.getUserByProviderUid("google.com", `provider-${token}`)).uid, token);
    } else if (id === "auth.passwordResetLink") {
      const link = await auth.generatePasswordResetLink(`${token}@example.test`);
      if (!link.includes("oobCode=")) throw new Error("Password reset link has no action code");
    } else if (id === "auth.emailVerificationLink") {
      const link = await auth.generateEmailVerificationLink(`${token}@example.test`);
      if (!link.includes("oobCode=")) throw new Error("Email verification link has no action code");
    } else if (id === "auth.verifyAndChangeEmailLink") {
      const link = await auth.generateVerifyAndChangeEmailLink(`${token}@example.test`, `${token}-new@example.test`);
      if (!link.includes("oobCode=")) throw new Error("Email change link has no action code");
    } else if (id === "auth.signInWithEmailLink") {
      const link = await auth.generateSignInWithEmailLink(`${token}@example.test`, { url: "https://example.test/finish" });
      if (!link.includes("oobCode=")) throw new Error("Email sign-in link has no action code");
    } else {
      throw new Error(`Unknown case: ${id}`);
    }
  });
}
