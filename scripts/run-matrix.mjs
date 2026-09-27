import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import workerd from "workerd";
import { suites, untested, projectId } from "../cases/manifest.mjs";
import { prepare, cleanup } from "./fixtures.mjs";

const check = process.argv.includes("--check");
const importsOnly = process.argv.includes("--imports-only");
const caseOption = process.argv.indexOf("--case");
const selectedCase = caseOption >= 0 ? process.argv[caseOption + 1] : undefined;
if (caseOption >= 0 && (!selectedCase || !suites.some((suite) => suite.cases.includes(selectedCase)))) {
  throw new Error(`Unknown or missing case ID: ${selectedCase ?? ""}`);
}
const outputRoot = path.resolve(".matrix-tmp");
const resultsPath = path.resolve("report/results.json");
const markdownPath = path.resolve("report/README.md");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));

process.env.GCLOUD_PROJECT = projectId;
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
process.env.FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9000";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
process.env.MATRIX_SERVICE_ACCOUNT = await readFile(path.join(outputRoot, "service-account.json"), "utf8");

function failure(status, stage, error) {
  return { status, stage, error: String(error).replaceAll(outputRoot, "<build-dir>").replace(/127\.0\.0\.1:\d+/g, "127.0.0.1:<port>") };
}

function classify(response) {
  return response.ok ? { status: "passed" } : failure("failed", response.stage ?? "operation", response.error ?? "Unknown failure");
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  await new Promise((resolve) => server.close(resolve));
  return address.port;
}

async function launchWorkerd(suite) {
  const directory = path.join(outputRoot, suite.name);
  const port = await availablePort();
  const template = await readFile(path.join(directory, "config.template.capnp"), "utf8");
  const config = path.join(directory, "config.capnp");
  await writeFile(config, template.replace("__PORT__", String(port)));
  const child = spawn(workerd.default, ["serve", "--experimental", config], { cwd: path.resolve(), stdio: ["ignore", "pipe", "pipe"] });
  let diagnostics = "";
  child.stdout.on("data", (chunk) => { diagnostics += chunk.toString(); });
  child.stderr.on("data", (chunk) => { diagnostics += chunk.toString(); });
  let exited = false;
  child.once("error", (error) => { diagnostics += error.message; exited = true; });
  child.once("exit", () => { exited = true; });
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (exited) break;
    try {
      const health = await fetch(`${base}/health`, { signal: AbortSignal.timeout(300) });
      if (health.ok) return { base, child, diagnostics: () => diagnostics };
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill();
  throw new Error(diagnostics.trim() || `workerd did not start for ${suite.name}`);
}

async function callWorkerd(running, id, token) {
  const url = new URL(running.base);
  url.searchParams.set("case", id);
  url.searchParams.set("token", token);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    return classify(await response.json());
  } catch (error) {
    return failure("environment-error", "transport", error instanceof Error ? error.message : error);
  }
}

async function callNode(module, id, token) {
  const url = new URL("http://matrix.local/");
  url.searchParams.set("case", id);
  url.searchParams.set("token", token);
  try {
    const response = await module.default.fetch(new Request(url));
    return classify(await response.json());
  } catch (error) {
    return failure("failed", "runtime", error instanceof Error ? error.message : error);
  }
}

async function withFixture(id, runtime, action) {
  const token = `${id.replaceAll(".", "-")}-${runtime}`;
  let prepared = false;
  let outcome;
  try {
    await prepare(id, token);
    prepared = true;
    outcome = await action(token);
  } catch (error) {
    outcome = failure("environment-error", prepared ? "harness" : "fixture", error instanceof Error ? error.message : error);
  }
  if (prepared) {
    try {
      await cleanup(id, token);
    } catch (error) {
      infrastructureError = true;
      process.stderr.write(`Cleanup failed for ${id}/${runtime}: ${error}\n`);
      if (outcome.status === "passed") {
        outcome = failure("environment-error", "cleanup", error instanceof Error ? error.message : error);
      }
    }
  }
  return outcome;
}

function comparison(node, runtime) {
  if (node.status === "untested" || runtime.status === "untested") return "untested";
  if (node.status !== "passed") return "incomparable";
  if (runtime.status === "passed") return "compatible";
  if (runtime.status === "failed") return "incompatible";
  return "incomparable";
}

const rows = [];
let infrastructureError = false;
for (const suite of suites) {
  if (selectedCase && !suite.cases.includes(selectedCase)) continue;
  const directory = path.join(outputRoot, suite.name);
  let nodeModule;
  let nodeImportError;
  try {
    nodeModule = await import(pathToFileURL(path.join(directory, "bundle.mjs")));
  } catch (error) {
    nodeImportError = error instanceof Error ? error.message : String(error);
  }
  let running;
  let workerdStartupError;
  try {
    running = await launchWorkerd(suite);
  } catch (error) {
    workerdStartupError = error instanceof Error ? error.message : String(error);
  }
  for (const id of suite.cases) {
    if (importsOnly && !id.endsWith(".import")) continue;
    if (selectedCase && id !== selectedCase) continue;
    let node;
    let runtime;
    if (untested.has(id)) {
      node = { status: "untested" };
      runtime = { status: "untested" };
    } else {
      node = nodeImportError
        ? failure("failed", "import", nodeImportError)
        : await withFixture(id, "node", (token) => callNode(nodeModule, id, token));
      runtime = workerdStartupError
        ? failure(workerdStartupError.includes("Uncaught") ? "failed" : "environment-error", workerdStartupError.includes("Uncaught") ? "import" : "startup", workerdStartupError)
        : await withFixture(id, "workerd", (token) => callWorkerd(running, id, token));
    }
    if (node.status === "environment-error" || runtime.status === "environment-error") infrastructureError = true;
    rows.push({ id, node, workerd: runtime, comparison: comparison(node, runtime) });
    process.stdout.write(`${id}: node=${node.status}, workerd=${runtime.status}\n`);
    if (selectedCase) process.stdout.write(`${JSON.stringify(rows.at(-1), null, 2)}\n`);
  }
  running?.child.kill();
}

if (!importsOnly && !selectedCase) {
const report = {
  schemaVersion: 1,
  versions: {
    firebaseAdmin: packageJson.dependencies["firebase-admin"],
    workerd: packageJson.devDependencies.workerd,
    node: process.version,
    compatibilityDate: "2026-09-27",
  },
  projectId,
  cases: rows,
};
const json = `${JSON.stringify(report, null, 2)}\n`;
const markdown = [
  "# Firebase Admin compatibility matrix",
  "",
  `Versions: firebase-admin ${report.versions.firebaseAdmin}, workerd ${report.versions.workerd}, Node.js ${report.versions.node}, compatibility date ${report.versions.compatibilityDate}.`,
  "",
  "The service operations use the Firebase Local Emulator Suite with a demo project. Messaging send is untested. Results describe these cases only.",
  "",
  "| Case | Node.js | workerd | Comparison |",
  "| --- | --- | --- | --- |",
  ...rows.map((row) => `| \`${row.id}\` | ${row.node.status} | ${row.workerd.status} | ${row.comparison} |`),
  "",
  "## Failures",
  "",
  ...rows.flatMap((row) => ["node", "workerd"].flatMap((runtime) => {
    const result = row[runtime];
    return result.error ? [`- \`${row.id}\` on ${runtime} (${result.stage}): ${result.error}`] : [];
  })),
  "",
  "Run `pnpm matrix` to regenerate the report or `pnpm matrix:check` to verify committed results.",
  "",
].join("\n");
await mkdir(path.dirname(resultsPath), { recursive: true });
if (check) {
  const [oldJson, oldMarkdown] = await Promise.all([
    readFile(resultsPath, "utf8").catch(() => ""),
    readFile(markdownPath, "utf8").catch(() => ""),
  ]);
  if (oldJson !== json || oldMarkdown !== markdown) {
    process.stderr.write("Generated matrix differs from committed files. Run pnpm matrix.\n");
    process.exitCode = 1;
  }
} else {
  await Promise.all([writeFile(resultsPath, json), writeFile(markdownPath, markdown)]);
}
}
if (infrastructureError) process.exitCode = 1;
