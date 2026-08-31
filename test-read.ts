import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId); 

async function test() {
  try {
    const snap = await getDocs(collection(db, 'events'));
    snap.forEach(doc => console.log(doc.id, doc.data().title));
  } catch (err: any) {
    console.error("Firestore Error:", err.message);
  }
}
test();
