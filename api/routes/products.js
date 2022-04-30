const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

//Handles GET requests to /products
router.get('/', (req,res,next)=>{
    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc=>{
                    return{
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        });
});

//Handles POST requests to /products
router.post('/', (req,res,next)=>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created object succesfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request:{
                        type:'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            })
        })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    });
});

//Handles GET with productID requests to /products
router.get('/:productID',(req,res,next)=>{
    Product.findById(req.params.productID)
    .select('name price _id')
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(201).json({
                product: doc,
                request: {
                    type:'GET',
                    url: 'http://localhost:3000/products/'
                } 
            })
        }
        else {
            res.status(404).json({message:'No valid entry for provided ID'})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });
});

//Handles PATCH (update) with productID requests to /products
router.patch('/:productID', (req, res, next) => {
    const id = req.params.productID;
    Product.findByIdAndUpdate(id, { $set: req.body }, { new: true})
      .then(result => res.status(200).json({
          message: 'Product update',
          requst: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + id
          }
      }))
      .catch(err => res.status(500).json({error: err}))
})

//Handles DELETE with productID requests to /products
router.delete('/:productID',(req,res,next)=>{
    Product.remove({_id: req.params.productID})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Product deleted',
                requst: {
                    type: 'POST',
                    url: 'http://localhost:3000/products/',
                    body: {name:'String',price:'Number'}
                }
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        });
});

module.exports = router; 