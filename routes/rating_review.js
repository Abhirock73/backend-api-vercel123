const express = require('express');
const ratingReview = require('../models/rating_review');
const Product = require('../models/product');

const ReviewRouter = express.Router();
ReviewRouter.post('/api/rating-review',async(req,res)=>{
     try{
         const {buyerId,email,fullName,productId,rating,review} = req.body;

          // if this user already reviewed
          const exist =  await ratingReview.findOne({buyerId,productId});

          if(exist){
               return res.status(300).json({msg:"you already made revied"});
          }

         const RatingReview= new ratingReview({buyerId,email,fullName,productId,rating,review});
         await RatingReview.save();
        
        //  // find the product associated by product id
         const product = await Product.findById(productId);
        //  // not fi=ound any product with this id
         if(!product){
            return res.status(404).json({msg:"no product Found"});
         }

         product.totalRatings +=1;

         product.averageRating = (product.averageRating * (product.totalRatings-1) + rating)/(product.totalRatings);
         // update the database
         await product.save();
         return res.status(200).send(RatingReview);
     }
     catch(e){
        return res.status(500).json({error:e.message});
     }
});

ReviewRouter.get('/api/ratingreview',async(req,res)=>{
    try{
        const RatingReview= await ratingReview.find();
        return res.status(200).send(RatingReview);
    }
    catch(e){
       return res.status(500).json({error:e.message});
    }
});

module.exports = ReviewRouter;