const express = require('express');
const app = express();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "API Documentation",
        version: '1.0.0',
      },
    },
    apis: ["app.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.urlencoded({extended: true}));
app.use(express.json())


const { MongoClient, ObjectId } = require('mongodb');
const { json } = require('express');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'dtApiCreation';

client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const collection = db.collection('events');

/**
 * @swagger
 * paths:
 *   /api/v3/app/events:
 *     get:
 *       summary: Gets a event by ID
 *       parameters:
 *          - in: query
 *            name: id
 *            type: string
 *            description: The event id for the event that needs to be searched
 *          - in: query
 *            name: type
 *            type: string
 *            description: latest or oldest result
 *          - in: query
 *            name: limit
 *            type: integer
 *            description: number of results to be displayed
 *          - in: query
 *            name: page
 *            type: integer
 *            description: the page number to be displayed
 *       responses:
 *         200:
 *           description: OK
*/

app.get('/api/v3/app/events', async (req, res) => {
    const {id, type, limit, page} = req.query;
    if(id) {
        const event = await collection.find({_id: ObjectId(id)}).toArray();
        console.log(event);
        if(!event){
            res.send('No matching event found!!!');
        } 
        res.send(event);
    }

    if(type) {
        const order = type==="latest" ? -1 : 1;
        const events = await collection.find()
                                        .sort({schedule : order})
                                        .skip(page>0 ? (page-1)*limit : 0)
                                        .limit(parseInt(limit))
                                        .toArray();
        // console.log(events);
        res.send(events);
    }
});

/**
 * @swagger
 * paths:
 *   /api/v3/app/events:
 *     post:
 *       summary: Create an event
 *       consumes:
 *          - application/json   
 *       parameters:
 *          - in: body
 *            name: event
 *            description: To create an event 
 *            schema:
 *              type: object
 *              properties:
 *                uid:
 *                  type: integer
 *                name:
 *                  type: string
 *                tagline:
 *                  type: string
 *                schedule:
 *                  type: string
 *                description:
 *                  type: string
 *                moderator:
 *                  type: string
 *                category:
 *                  type: string
 *                sub-category: 
 *                  type: string
 *                rigor-rank:
 *                  type: integer
 *       responses:
 *         200:
 *           description: OK
*/

app.post('/api/v3/app/events', async (req, res) => {
    const event = [req.body];
    await collection.insertMany(event);

    res.send(event);
});

/**
 * @swagger
 * paths:
 *   /api/v3/app/events/{id}:
 *     put:
 *       summary: Update an event
 *       consumes:
 *          - application/json   
 *       parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The event id for the event that needs to be searched
 *          - in: body
 *            name: event
 *            description: To update an event 
 *            schema:
 *              type: object
 *              properties:
 *                uid:
 *                  type: integer
 *                name:
 *                  type: string
 *                tagline:
 *                  type: string
 *                schedule:
 *                  type: string
 *                description:
 *                  type: string
 *                moderator:
 *                  type: string
 *                category:
 *                  type: string
 *                sub-category: 
 *                  type: string
 *                rigor-rank:
 *                  type: integer
 *       responses:
 *         200:
 *           description: OK
*/

app.put('/api/v3/app/events/:id', async (req, res) => {
    const {id} = req.params;
    const content = req.body;
    console.log(content);
    await collection.updateOne({_id: ObjectId(id)}, {$set: content});

    const event = await collection.find({_id: ObjectId(id)}).toArray();
    res.send(event);
});

/**
 * @swagger
 * paths:
 *   /api/v3/app/events/{id}:
 *     delete:
 *       summary: Delete an event
 *       consumes:
 *          - application/json   
 *       parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The event id for the event that needs to be searched and deleted
 *       responses:
 *         200:
 *           description: OK
*/

app.delete('/api/v3/app/events/:id', async (req, res) => {
    const {id} = req.params;
    const event = await collection.find({_id: ObjectId(id)}).toArray();

    collection.deleteOne({_id: ObjectId(id)});

    res.send(event);
}); 

app.listen(3000, () => {
    console.log('listening on port 3000');
})