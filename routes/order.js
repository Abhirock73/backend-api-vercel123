const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');

const {user,vendorAuth} = require("../middleware/auth");
const productRouter = require('./product');
const Product = require('../models/product');


// Post route for creating order
orderRouter.post('/api/order', user ,async (req, res) => {
    try {
        const {
            fullName,
            email,
            state,
            city,
            locality,
            productName,
            productPrice,
            quantity,
            category,
            image,
            buyerId,
            vendorId,
            productId
        } = req.body;

        const createdAt = new Date().getMilliseconds();

        // Create new order instance with Order field
        const order = new Order({
            fullName,
            email,
            state,
            city,
            locality,
            productName,
            productPrice,
            quantity,
            category,
            image,
            buyerId,
            vendorId,
            createdAt,
            productId
        });

        await order.save();

        // Send a JSON response with status code 200
        res.status(200).json(order); // Corrected

    } catch (e) {
        // Send a JSON response with status code 500
        res.status(500).json({ error: e.message }); // Corrected
    }
});

// fetch order by buyerID

orderRouter.get('/api/orders/:buyerId', user,async(req,res)=>{
      try {
         //extract buyer id from req parametrer
         const {buyerId}=req.params;

         //fidn all order bu this id
         const orders = await Order.find({buyerId});
         // if orders are empty
         if(orders.length == 0 ){
            return res.status(404).send({msg:"No order Found"});
         } 
         else{
            return res.status(200).send(orders);
         }
        
      } catch (e) {
        return res.status(500).send({error:e.message});
      }
});


// delete route for deleting specific order by id

orderRouter.delete("/api/delete/:id",user,async(req,res)=>{
    try {
         //extract id from req body
         const {id} = req.params;
         // find and delete from the database
         const deletedOrder = await Order.findByIdAndDelete(id);
         // check if an order found and deleted
         if(!deletedOrder){
            // order is not founded with this id
            return res.status(404).send({msg:"not found order"});
         }
         else{
            return res.status(200).send({msg:"Successfully deletd"});
         }
        
    } catch (e) {
        return res.status(200).send({error:e.message});
    }
});

// fetch order by vendorId
orderRouter.get('/api/orders/vendors/:vendorId',user,vendorAuth,async(req,res)=>{
    try {
       //extract buyer id from req parametrer
       const {vendorId}=req.params;

       //fidn all order bu this id
       const orders = await Order.find({vendorId});
       // if orders are empty
       if(orders.length == 0 ){
          return res.status(404).send({msg:"No order Found"});
       } 
       else{
          return res.status(200).send(orders);
       }
      
    } catch (e) {
      return res.status(500).send({error:e.message});
    }
});


orderRouter.patch('/api/orders/:id/delivered', async(req,res)=>{
    try {
         const {id} = req.params;

         const updateStatus = await Order.findByIdAndUpdate(id,
              {delivered:true,processing:false},
              {new:true});
        
        if(!updateStatus){
            return res.status(404).json("not found id");
        }
        else{
            return res.status(200).json(updateStatus);
        }
    } catch (e) {
        return res.status(500).send({error:e.message});
    }
});

orderRouter.patch('/api/orders/:id/processing', async(req,res)=>{
    try {
         const {id} = req.params;

         const updateStatus = await Order.findByIdAndUpdate(id,
              {processing:false,delivered:true},
              {new:true});
        
        if(!updateStatus){
            return res.status(404).json("not found id");
        }
        else{
            return res.status(200).json(updateStatus);
        }
    } catch (e) {
        return res.status(500).send({error:e.message});
    }
});


// fetch all of the users

orderRouter.get('/api/orders',async(req,res)=>{
    try {
      const orders =  await Order.find();
      return res.status(200).json(orders);
    } catch (e) {
      return res.status(404).json({error:e.message});
    }
});


module.exports = orderRouter;