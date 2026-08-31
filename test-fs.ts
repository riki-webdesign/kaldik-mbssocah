import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId); // Use correct ID

async function test() {
  try {
    console.log("Testing write...");
    await setDoc(doc(db, 'events', 'test-write-123'), { title: 'Test', startDate: '2026-08-30' });
    console.log("Write success!");
    console.log("Testing read...");
    const snap = await getDocs(collection(db, 'events'));
    console.log("Read success, docs:", snap.size);
  } catch (err: any) {
    console.error("Firestore Error:", err.message);
  }
}
test();
