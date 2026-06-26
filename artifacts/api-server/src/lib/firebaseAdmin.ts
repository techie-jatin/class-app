import admin from "firebase-admin";

let app: admin.app.App;

function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    throw new Error(
      "Missing Firebase Admin env vars: VITE_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
    );
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  return app;
}

export async function verifyFirebaseToken(
  idToken: string,
): Promise<admin.auth.DecodedIdToken> {
  const adminApp = getFirebaseAdmin();
  return adminApp.auth().verifyIdToken(idToken);
}
