import { getStorage } from "firebase-admin/storage";
import { expectEqual, withApp } from "./shared.mjs";

export async function runCase(id, token) {
  if (id === "storage.import") {
    expectEqual(typeof getStorage, "function");
    return;
  }
  await withApp(token, async (app) => {
    const file = getStorage(app).bucket().file(`matrix/${token}`);
    if (id === "storage.upload") {
      await file.save(`value:${token}`, { resumable: false });
    } else if (id === "storage.download") {
      const [data] = await file.download();
      expectEqual(data.toString(), `value:${token}`);
    } else if (id === "storage.delete") {
      await file.delete();
    } else {
      throw new Error(`Unknown case: ${id}`);
    }
  });
}
