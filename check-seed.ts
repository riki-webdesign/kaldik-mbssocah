import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId); 

async function test() {
  const seedDocRef = doc(db, 'system_meta', 'seed_status');
  const snap = await getDoc(seedDocRef);
  console.log(snap.exists() ? snap.data() : 'not seeded');
}
test();
