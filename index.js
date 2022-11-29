const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gtp2h2a.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const allProductCollection = client.db('old-shop').collection('allProducts')
        const allCategories = client.db('old-shop').collection('Categories')
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await allProductCollection.find(query).toArray();
            res.send(products);
        });
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await allCategories.find(query).toArray();
            res.send(categories);
        });

        app.get('/category/:id', async (req, res) => {
            const category = req.params.id;
            const query = { category }
            const categoryProducts = await allProductCollection.find(query).toArray();
            res.send(categoryProducts)
        })

    }
    finally {

    }
}
run().catch(er => console.log(er))


app.get('/', (req, res) => {
    res.send('Server running for Old-sHop')
})

app.listen(port, () => console.log('port is running'))