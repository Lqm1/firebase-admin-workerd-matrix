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
    } else if (id === "storage.metadata") {
      const [metadata] = await file.getMetadata();
      expectEqual(metadata.name, `matrix/${token}`);
    } else if (id === "storage.list") {
      const [files] = await getStorage(app).bucket().getFiles({ prefix: `matrix/${token}` });
      if (!files.some((entry) => entry.name === `matrix/${token}`)) throw new Error("Uploaded file not listed");
    } else if (id === "storage.copy") {
      const [copy] = await file.copy(`matrix/${token}-copy`);
      const [data] = await copy.download();
      expectEqual(data.toString(), `value:${token}`);
    } else {
      throw new Error(`Unknown case: ${id}`);
    }
  });
}
