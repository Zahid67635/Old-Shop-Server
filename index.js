const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Server running for Old-sHop')
})

app.listen(port, () => console.log('port is running'))