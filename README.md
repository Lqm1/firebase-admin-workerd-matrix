# Firebase Admin workerd compatibility matrix

This project runs selected `firebase-admin` imports and operations in Node.js and a local `workerd` process. The [matrix](report/README.md) records each result. It is a test of the listed cases with the pinned versions and Firebase emulators, not a claim that a whole Firebase service works in a deployed Worker.

## Coverage

The matrix tests the package root and the Auth, Firestore, Realtime Database, Storage, and Messaging module entries. It also tests independent create, read, and delete operations for the four emulated services. Messaging client creation is tested; sending is marked untested because the Local Emulator Suite does not provide an FCM send emulator.

Each operation has its own fixture. A failed create case therefore does not prevent the read or delete cases from running. The same bundled case runs first in Node.js and then in `workerd`. If Node.js fails, the comparison is *incomparable*. A `workerd` failure after a passing Node.js baseline is *incompatible* for that case.

## Run locally

You need Node.js 24.21.0 or later, pnpm 12.6.0, and JDK 21 or later. On Windows, set `JAVA_HOME` to a JDK 21+ installation before running the emulators.

```sh
pnpm install --frozen-lockfile
pnpm matrix
```

`pnpm matrix` builds the six independent suites, starts the Firebase Auth, Firestore, Realtime Database, and Storage emulators with a `demo-` project ID, runs the Node.js and `workerd` cases, then writes [JSON](report/results.json) and [Markdown](report/README.md) results. It generates a temporary service account key under `.matrix-tmp/` for the emulators. This directory is ignored by Git. No live Firebase project or credential is required.

Run `pnpm matrix:check` to compare regenerated output with the committed report. GitHub Actions runs this on each pull request. Environment failures and stale generated files fail the job; compatibility differences remain visible in the report for review.

For a quick import-only probe without emulators, run `pnpm matrix:imports`.

To rerun one case without replacing the committed report, build the suites and pass its ID to the runner under the emulators. For example:

```sh
pnpm matrix:build
pnpm exec firebase emulators:exec --project demo-workerd-matrix --only auth,firestore,database,storage "node scripts/run-matrix.mjs --case firestore.read"
```

## Interpreting results

The JSON report keeps the exact `firebase-admin`, `workerd`, Node.js, and compatibility date versions. Every case has a stable ID and one result per runtime. `passed` means that the listed import or operation completed and its assertion held. `failed` records an SDK or runtime error. `environment-error` records a fixture or harness failure. `untested` identifies operations outside this first set. The Markdown report includes the error stage and message for failed cases.

Firestore uses the SDK's `preferRest` option so these cases exercise its HTTP/1.1 transport. Storage uploads use non-resumable uploads. These settings are part of the tested scenario.
