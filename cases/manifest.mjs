export const suites = [
  { name: "app", cases: ["app.import"] },
  { name: "auth", cases: ["auth.import", "auth.create", "auth.get", "auth.delete"] },
  { name: "firestore", cases: ["firestore.import", "firestore.write", "firestore.read", "firestore.delete"] },
  { name: "database", cases: ["database.import", "database.write", "database.read", "database.delete"] },
  { name: "storage", cases: ["storage.import", "storage.upload", "storage.download", "storage.delete"] },
  { name: "messaging", cases: ["messaging.import", "messaging.create", "messaging.send"] },
];

export const untested = new Set(["messaging.send"]);
export const projectId = "demo-workerd-matrix";
export const bucketName = `${projectId}.appspot.com`;
