const mongoose = require('mongoose');
const Category = require('./category');

const productSchema = mongoose.Schema({
     productName:{
        type:String,
        trim:true,
        required:true,
     },
     productPrice:{
        type:Number,
        required:true,
     },
     quantity:{
        type:Number,
        required:true,
     },
     description:{
        type:String,
        required:true,
     },
     category:{
        type:String,
        required:true,
     },
     vendorId:{
         type:String,
         required:true,
     },
     fullName:{
          type:String,
          required:true,
     },
     subCategory:{
        type:String,
        required:true,
     },
     image:[
        {
            type:String,
            required:true,
        }
     ],
     popular:{
        type:Boolean,
        default:true,
     },
     recommend:{
        type:Boolean,
        default:true,
     },
     // add field for rating

      averageRating:{
         type:Number,
         default:0.0,
      },
      totalRatings:{
         type:Number,
         default:0.0,
      },

});
const Product = mongoose.model("Product",productSchema);
module.exports = Product;