# Firebase Admin compatibility matrix

Versions: firebase-admin 14.5.0, workerd 1.20260927.1, Node.js v24.21.0, compatibility date 2026-09-27.

The service operations use the Firebase Local Emulator Suite with a demo project. Messaging send is untested. Results describe these cases only.

| Case | Node.js | workerd | Comparison |
| --- | --- | --- | --- |
| `app.import` | passed | passed | compatible |
| `auth.import` | passed | passed | compatible |
| `auth.create` | passed | passed | compatible |
| `auth.get` | passed | passed | compatible |
| `auth.delete` | passed | passed | compatible |
| `firestore.import` | passed | passed | compatible |
| `firestore.write` | passed | failed | incompatible |
| `firestore.read` | passed | failed | incompatible |
| `firestore.delete` | passed | failed | incompatible |
| `database.import` | passed | passed | compatible |
| `database.write` | passed | passed | compatible |
| `database.read` | passed | passed | compatible |
| `database.delete` | passed | passed | compatible |
| `storage.import` | passed | passed | compatible |
| `storage.upload` | passed | passed | compatible |
| `storage.download` | passed | passed | compatible |
| `storage.delete` | passed | passed | compatible |
| `messaging.import` | passed | passed | compatible |
| `messaging.create` | passed | passed | compatible |
| `messaging.send` | untested | untested | untested |

## Failures

- `firestore.write` on workerd (operation): Code generation from strings disallowed for this context
- `firestore.read` on workerd (operation): Code generation from strings disallowed for this context
- `firestore.delete` on workerd (operation): Code generation from strings disallowed for this context

Run `pnpm matrix` to regenerate the report or `pnpm matrix:check` to verify committed results.
