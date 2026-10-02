# Firebase Admin compatibility matrix

Versions: firebase-admin 14.5.0, workerd 1.20260927.1, Node.js v24.21.0, compatibility date 2026-09-27.

The service operations use the Firebase Local Emulator Suite with a demo project. Messaging send is untested. Results describe these inputs and cases only, not full service compatibility or production behavior.
Auth method coverage is discovered from the installed SDK. `auth.import` tests module loading; `auth.importUsers` tests the user import method. Unmapped methods are untested and must not be treated as compatible.

| Case | Node.js | workerd | Comparison |
| --- | --- | --- | --- |
| `app.import` | passed | passed | compatible |
| `auth.import` | passed | passed | compatible |
| `auth.create` | passed | passed | compatible |
| `auth.get` | passed | passed | compatible |
| `auth.delete` | passed | passed | compatible |
| `auth.getByEmail` | passed | passed | compatible |
| `auth.getByPhone` | passed | passed | compatible |
| `auth.getMany` | passed | passed | compatible |
| `auth.list` | passed | passed | compatible |
| `auth.update` | passed | passed | compatible |
| `auth.deleteMany` | passed | passed | compatible |
| `auth.setClaims` | passed | passed | compatible |
| `auth.revoke` | passed | passed | compatible |
| `auth.importUsers` | passed | passed | compatible |
| `auth.createCustomToken` | passed | passed | compatible |
| `auth.verifyIdToken` | passed | passed | compatible |
| `auth.createSessionCookie` | passed | passed | compatible |
| `auth.verifySessionCookie` | passed | passed | compatible |
| `auth.getByProvider` | passed | passed | compatible |
| `auth.passwordResetLink` | passed | passed | compatible |
| `auth.emailVerificationLink` | passed | passed | compatible |
| `auth.verifyAndChangeEmailLink` | passed | passed | compatible |
| `auth.signInWithEmailLink` | passed | passed | compatible |
| `firestore.import` | passed | passed | compatible |
| `firestore.write` | passed | failed | incompatible |
| `firestore.read` | passed | failed | incompatible |
| `firestore.delete` | passed | failed | incompatible |
| `database.import` | passed | passed | compatible |
| `database.write` | passed | passed | compatible |
| `database.read` | passed | passed | compatible |
| `database.delete` | passed | passed | compatible |
| `database.update` | passed | passed | compatible |
| `database.query` | passed | passed | compatible |
| `database.transaction` | passed | passed | compatible |
| `storage.import` | passed | passed | compatible |
| `storage.upload` | passed | passed | compatible |
| `storage.download` | passed | passed | compatible |
| `storage.delete` | passed | passed | compatible |
| `storage.metadata` | passed | passed | compatible |
| `storage.list` | passed | passed | compatible |
| `storage.copy` | passed | passed | compatible |
| `messaging.import` | passed | passed | compatible |
| `messaging.create` | passed | passed | compatible |
| `messaging.send` | untested | untested | untested |

## Auth method coverage

21 of 28 public Auth methods have behavior cases. The import case only checks module loading and is not an Auth method.

| Method | Case | Node.js | workerd | Comparison |
| --- | --- | --- | --- | --- |
| `createCustomToken` | `auth.createCustomToken` | passed | passed | compatible |
| `createProviderConfig` | — | untested | untested | untested |
| `createSessionCookie` | `auth.createSessionCookie` | passed | passed | compatible |
| `createUser` | `auth.create` | passed | passed | compatible |
| `deleteProviderConfig` | — | untested | untested | untested |
| `deleteUser` | `auth.delete` | passed | passed | compatible |
| `deleteUsers` | `auth.deleteMany` | passed | passed | compatible |
| `generateEmailVerificationLink` | `auth.emailVerificationLink` | passed | passed | compatible |
| `generatePasswordResetLink` | `auth.passwordResetLink` | passed | passed | compatible |
| `generateSignInWithEmailLink` | `auth.signInWithEmailLink` | passed | passed | compatible |
| `generateVerifyAndChangeEmailLink` | `auth.verifyAndChangeEmailLink` | passed | passed | compatible |
| `getProviderConfig` | — | untested | untested | untested |
| `getUser` | `auth.get` | passed | passed | compatible |
| `getUserByEmail` | `auth.getByEmail` | passed | passed | compatible |
| `getUserByPhoneNumber` | `auth.getByPhone` | passed | passed | compatible |
| `getUserByProviderUid` | `auth.getByProvider` | passed | passed | compatible |
| `getUsers` | `auth.getMany` | passed | passed | compatible |
| `importUsers` | `auth.importUsers` | passed | passed | compatible |
| `listProviderConfigs` | — | untested | untested | untested |
| `listUsers` | `auth.list` | passed | passed | compatible |
| `projectConfigManager` | — | untested | untested | untested |
| `revokeRefreshTokens` | `auth.revoke` | passed | passed | compatible |
| `setCustomUserClaims` | `auth.setClaims` | passed | passed | compatible |
| `tenantManager` | — | untested | untested | untested |
| `updateProviderConfig` | — | untested | untested | untested |
| `updateUser` | `auth.update` | passed | passed | compatible |
| `verifyIdToken` | `auth.verifyIdToken` | passed | passed | compatible |
| `verifySessionCookie` | `auth.verifySessionCookie` | passed | passed | compatible |

## Failures

- `firestore.write` on workerd (operation): Code generation from strings disallowed for this context
- `firestore.read` on workerd (operation): Code generation from strings disallowed for this context
- `firestore.delete` on workerd (operation): Code generation from strings disallowed for this context

Run `pnpm matrix` to regenerate the report or `pnpm matrix:check` to verify committed results.
