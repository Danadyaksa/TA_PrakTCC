const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_CONFIG) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (error) {
    console.error("🔥 Error parsing FIREBASE_CONFIG environment variable:", error);
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require('./firebase-config.json');
  } catch (error) {
    console.error("🔥 Error loading firebase-config.json file:", error);
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount ? `${serviceAccount.project_id}.appspot.com` : undefined)
});

const db = admin.firestore();

console.log("🔥 Firebase Firestore Connected!");

module.exports = db;
