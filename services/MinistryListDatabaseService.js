import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Initialize Firebase app if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Firestore instance
export const db = getFirestore();

/**
 * Fetches documents from Firestore, mirroring the previous RNFirebase service.
 * @param {string} collectionName - Name of the collection to query.
 * @param {Array<string>} subs - Array of ministryId values for 'in' queries on 'maincollection'.
 * @returns {Promise<Array<object>>} - Array of document data objects.
 */
export default async function MinistryListDatabaseService(
  collectionName,
  subs
) {
  const minArr = [];
  const prayerData = [];

  if (collectionName === "maincollection") {
    try {
      // Build a query for ministryId in subs
      const q = query(
        collection(db, collectionName),
        where("ministryId", "in", subs)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        prayerData.push(doc.data());
      });
      console.log("prayerData:", prayerData);
      return prayerData;
    } catch (error) {
      console.log("Error fetching maincollection:", error);
      return [];
    }
  } else {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      snapshot.forEach((doc) => {
        minArr.push(doc.data());
      });

      return minArr;
    } catch (error) {
      console.log(`Error fetching ${collectionName}:`, error);
      return [];
    }
  }
}
