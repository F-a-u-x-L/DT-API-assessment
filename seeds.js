import { MongoClient, ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker';

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'dtApiCreation';

client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const collection = db.collection('events');

console.log(faker.name.findName());
const Arr = [];

for(let i=0; i<10; i++)
{
    const Obj = {
        type: "event",
        uid: faker.random.numeric(10),
        name: faker.name.findName(),
        tagline: faker.lorem.lines(),
        description: faker.lorem.sentences(2),
        schedule: faker.date.past()
    }

    Arr.push(Obj);
}

await collection.insertMany(Arr);

client.close();