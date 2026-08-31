import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  const unsub = onSnapshot(collection(db, 'events'), (snap) => {
     console.log("Snapshot received, size:", snap.size);
  }, (err) => {
     console.error("Snapshot error:", err);
  });
  
  setTimeout(() => { unsub(); console.log("Done"); }, 5000);
}
test();
