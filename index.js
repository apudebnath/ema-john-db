const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors')
require('dotenv').config()

const port = 5000;

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.APP_USER}:${process.env.APP_PASS}@cluster0.mthak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        const database = client.db('emajohndb');
        const pdCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        // GET products API
        app.get('/products', async(req, res) =>{
            const cursor = pdCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();

            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        })

        // Use POST to get data by keys
        app.post('/products/byKeys', async(req, res) => {
            const keys = req.body;
            const query = {key: {$in: keys}}
            const products = await pdCollection.find(query).toArray();
            res.json(products);
        })

        //Add Orders API
        app.post('/orders',async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })

        console.log('Server is now live');
    }
    finally{
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => { 
    res.send('Ema-john server running')
});
app.listen(port, () => {
    console.log('App listening is port', port)
});




