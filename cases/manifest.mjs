export const suites = [
  { name: "app", cases: ["app.import"] },
  { name: "auth", cases: [
    "auth.import", "auth.create", "auth.get", "auth.delete",
    "auth.getByEmail", "auth.getByPhone", "auth.getMany", "auth.list",
    "auth.update", "auth.deleteMany", "auth.setClaims", "auth.revoke",
    "auth.importUsers", "auth.createCustomToken", "auth.verifyIdToken",
    "auth.createSessionCookie", "auth.verifySessionCookie",
    "auth.getByProvider", "auth.passwordResetLink", "auth.emailVerificationLink",
    "auth.verifyAndChangeEmailLink", "auth.signInWithEmailLink",
  ] },
  { name: "firestore", cases: ["firestore.import", "firestore.write", "firestore.read", "firestore.delete"] },
  { name: "database", cases: ["database.import", "database.write", "database.read", "database.delete", "database.update", "database.query", "database.transaction"] },
  { name: "storage", cases: ["storage.import", "storage.upload", "storage.download", "storage.delete", "storage.metadata", "storage.list", "storage.copy"] },
  { name: "messaging", cases: ["messaging.import", "messaging.create", "messaging.send"] },
];

export const untested = new Set(["messaging.send"]);
export const projectId = "demo-workerd-matrix";
export const bucketName = `${projectId}.appspot.com`;
