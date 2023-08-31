require('dotenv').config();
//async errors package
require('express-async-errors')

const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const errorHandlerMW = require('./middleware/error-handler');
const notFoundMW = require('./middleware/not-found');
const productsRouter = require('./routes/products')

//middleware
app.use(express.json());


//routes
app.get('/', (req, res) => {
    res.send('<h1>Store API</h1><a href="/api/v1/products">product route</a>')
})

//routes for the products
app.use('/api/v1/products', productsRouter)

//products route

app.use(errorHandlerMW, notFoundMW);

const port = process.env.PORT || 3000;

const start = async() => {
    try{
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server on port ${port}..`))
    } catch (error) {
        console.log(error)
    }
}

start()