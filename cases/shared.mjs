import { cert, deleteApp, initializeApp } from "firebase-admin/app";

export const projectId = "demo-workerd-matrix";
export const bucketName = `${projectId}.appspot.com`;

export async function withApp(token, action) {
  const app = initializeApp(
    {
      projectId,
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
      storageBucket: bucketName,
      credential: cert(JSON.parse(process.env.MATRIX_SERVICE_ACCOUNT)),
    },
    `matrix-${token}`,
  );
  try {
    return await action(app);
  } finally {
    await deleteApp(app);
  }
}

export function expectEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
