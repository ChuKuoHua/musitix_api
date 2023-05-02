import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config({ path: './.env' });

const config = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_X509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  // https://stackoverflow.com/questions/50272165/firebase-import-service-throws-error
  // 這裡的import會有問題，故轉成any
  credential: admin.credential.cert(config as any),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
});

module.exports = admin;
export default admin;
