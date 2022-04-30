//Node.js framework backend
const express = require('express');
const app = express();

//Logger 
const morgan = require('morgan');

//Parser of bodies, cant handle files
const bodyParser = require('body-parser');

//MongoDB 
const mongoose = require('mongoose');

//Routes for the diffrent objects
const produtRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

//Connect to mongodb
mongoose.connect(
    'mongodb+srv://admin:' + 
    process.env.MONGO_ATLAS_PW + 
    '@node-rest-shop.pu8hr.mongodb.net/node-rest-shop?retryWrites=true&w=majority'
);
mongoose.Promise = global.Promise;

//Logs to terminal
app.use(morgan('dev'));

//Body parses, extended allows extended with rich data, false only support url encoded data. 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());   //Extracts json data

app.use((req,res,next)=>{
    res.header('Acces-Control-Allow-Origin','*');
    res.header('Acces-Control-Allow-Headers','Origin, X-Requested-Width, Content-Type, Accept, Authorization');

    if(req.method === 'OPTIONS'){ //browser will always ask for options
        res.header('Acces-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({});
    }
    next();
});

//Routes which should handle requst
app.use('/products', produtRoutes);
app.use('/orders', orderRoutes);

//Catching every error not handled by a route 
app.use((req,res,next)=>{
    const error = new Error('Page not found');
    error.status = 404;
    next(error);
})

//Catching every error from everywhere 
app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

//Makes file usable outside of this file
module.exports = app;