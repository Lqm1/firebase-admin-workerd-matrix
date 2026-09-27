import { mkdir, rm, writeFile } from "node:fs/promises";
import { generateKeyPairSync } from "node:crypto";
import path from "node:path";
import { builtinModules } from "node:module";
import { build } from "esbuild";
import { suites } from "../cases/manifest.mjs";

const outputRoot = path.resolve(".matrix-tmp");
await mkdir(outputRoot, { recursive: true });
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
await writeFile(path.join(outputRoot, "service-account.json"), JSON.stringify({
  projectId: "demo-workerd-matrix",
  clientEmail: "matrix@demo-workerd-matrix.iam.gserviceaccount.com",
  privateKey,
}));
const names = [...new Set(builtinModules.map((name) => name.replace(/^node:/, "")))];
const banner = `
  import { createRequire } from "node:module";
  import { fileURLToPath } from "node:url";
  import { dirname } from "node:path";
  const bundleUrl = import.meta.url ?? "/bundle/bundle.mjs";
  const nativeRequire = createRequire(bundleUrl);
  const __dirname = import.meta.url ? dirname(fileURLToPath(import.meta.url)) : "/bundle";
  const builtins = new Map();
  for (const name of ${JSON.stringify(names)}) {
    try { builtins.set(name, await import("node:" + name)); } catch {}
  }
  function require(name) {
    const key = name.replace(/^node:/, "");
    const module = builtins.get(key);
    return module ? module.default ?? module : nativeRequire(name);
  }
`;

for (const suite of suites) {
  const directory = path.join(outputRoot, suite.name);
  await mkdir(directory, { recursive: true });
  await rm(path.join(directory, "bundle.mjs"), { force: true });
  await rm(path.join(directory, "build-error.txt"), { force: true });
  const source = `
    import { runCase } from "./cases/${suite.name}.mjs";
    export default {
      async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === "/health") return new Response("ok");
        const id = url.searchParams.get("case");
        const token = url.searchParams.get("token");
        if (!id || !token) return Response.json({ ok: false, stage: "request", error: "Missing case or token" }, { status: 400 });
        try {
          await runCase(id, token);
          return Response.json({ ok: true });
        } catch (error) {
          return Response.json({ ok: false, stage: "operation", error: error instanceof Error ? error.message : String(error) });
        }
      }
    };
  `;
  try {
    await build({
      stdin: { contents: source, resolveDir: path.resolve(), sourcefile: `${suite.name}-entry.mjs`, loader: "js" },
      outfile: path.join(directory, "bundle.mjs"),
      bundle: true,
      platform: "node",
      format: "esm",
      target: "es2022",
      banner: { js: banner },
      logLevel: "silent",
    });
    const config = `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [
    (name = "main", worker = .worker),
    (name = "internet", network = (allow = ["local"]))
  ],
  sockets = [(name = "http", address = "127.0.0.1:__PORT__", http = (), service = "main")]
);
const worker :Workerd.Worker = (
  modules = [(name = "bundle.mjs", esModule = embed "bundle.mjs")],
  compatibilityDate = "2026-09-27",
  bindings = [
    (name = "GCLOUD_PROJECT", text = "demo-workerd-matrix"),
    (name = "FIREBASE_AUTH_EMULATOR_HOST", text = "127.0.0.1:9099"),
    (name = "FIRESTORE_EMULATOR_HOST", text = "127.0.0.1:8085"),
    (name = "FIREBASE_DATABASE_EMULATOR_HOST", text = "127.0.0.1:9000"),
    (name = "FIREBASE_STORAGE_EMULATOR_HOST", text = "127.0.0.1:9199"),
    (name = "MATRIX_SERVICE_ACCOUNT", json = embed "../service-account.json")
  ]
);
`;
    await writeFile(path.join(directory, "config.template.capnp"), config);
    process.stdout.write(`${suite.name}: built\n`);
  } catch (error) {
    await writeFile(path.join(directory, "build-error.txt"), error instanceof Error ? error.message : String(error));
    process.stdout.write(`${suite.name}: build failed\n`);
  }
}
