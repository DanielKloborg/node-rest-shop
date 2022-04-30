const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

//Handles GET requests to /orders
router.get('/', (req,res,next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product','name price') //.populate('product','(objects you want)')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            orders: docs.map(doc=>{
                return{
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request:{
                        type:'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
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

//Handles POST requests to /orders
router.post('/', (req,res,next)=>{
    Product.findById(req.body.productID)
    .then(product=>{
        if(!product){
            return res.status(404).json({
                message: "Product not found"
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productID
        });
        return order.save()
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created order succesfully',
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity,
                request:{
                    type:'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            message: 'Product not found',
            error: err
        });
    });
});

//Handles GET with orderID requests to /orders
router.get('/:orderID',(req,res,next)=>{
    Order.findById(req.params.orderID)
    .select('product quantity _id')
    .populate('product','name price')
    .exec()
    .then(order =>{
        console.log("From database", order);
        if(order){
            res.status(201).json({
                order: order,
                request: {
                    type:'GET',
                    url: 'http://localhost:3000/orders/'
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

//Handles PATCH (update) with orderID requests to /orders
router.patch('/:orderID',(req,res,next)=>{
    const id = req.params.orderID;
    Product.findByIdAndUpdate(id, { $set: req.body }, { new: true})
      .then(result => res.status(200).json({
          message: 'Order Updated',
          requst: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + id
          }
      }))
      .catch(err => res.status(500).json({ error: err}))
});

//Handles DELETE with orderID requests to /orders
router.delete('/:orderID',(req,res,next)=>{
    Order.remove({_id: req.params.orderID})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Order deleted',
                requst: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/',
                    body: {productID: 'ID', quantity: 'Number'}
                }
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        });
});

module.exports = router; 