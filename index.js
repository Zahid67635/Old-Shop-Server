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


//jwt verify function
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}
async function run() {
    try {
        const allProductCollection = client.db('old-shop').collection('allProducts');
        const allCategories = client.db('old-shop').collection('Categories');
        const bookingsCollection = client.db('old-shop').collection('bookings');
        const usersCollection = client.db('old-shop').collection('users');
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await allProductCollection.find(query).toArray();
            res.send(products);
        });
        app.get('/sellerProducts', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Access Forbidden' })
            }
            const result = await allProductCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/sellerProducts/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Access Forbidden' })
            }
            const result = await allProductCollection.deleteOne(query);
            res.send(result);
        })
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
        app.post('/products', async (req, res) => {
            const addedProduct = req.body;
            const result = await allProductCollection.insertOne(addedProduct);
            res.send(result);
        })
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Access Forbidden' })
            }
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

    }
    finally {

    }
}
run().catch(er => console.log(er))


app.get('/', (req, res) => {
    res.send('Server running for Old-sHop')
})

app.listen(port, () => console.log('port is running'))