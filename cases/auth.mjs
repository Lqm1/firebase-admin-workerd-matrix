import { getAuth } from "firebase-admin/auth";
import { expectEqual, withApp } from "./shared.mjs";

export async function runCase(id, token) {
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
    } else {
      throw new Error(`Unknown case: ${id}`);
    }
  });
}
