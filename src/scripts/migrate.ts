import fs from 'fs/promises';
import path from 'path';
import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const DB_FILE = path.join(process.cwd(), 'src/data/db.json');

const migrate = async () => {
    try {
        console.log('Reading db.json...');
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const json = JSON.parse(data);

        for (const collectionName in json) {
            console.log(`Migrating collection: ${collectionName}...`);
            const items = json[collectionName];
            
            if (Array.isArray(items)) {
                for (const [index, item] of items.entries()) {
                    const docId = item.id?.toString() || item.key?.toString() || (index + 1).toString();
                    await setDoc(doc(db, collectionName, docId), item);
                }
            } else if (typeof items === 'object' && items !== null) {
                await setDoc(doc(db, collectionName, 'main'), items);
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

migrate();
