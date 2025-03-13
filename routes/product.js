const express = require('express');
const Product = require('../models/product');

const productRouter = express.Router();

// FIX: Corrected import of auth middleware
const { user, vendorAuth } = require('../middleware/auth');

productRouter.post('/api/add-product', user, vendorAuth, async (req, res) => {
    try {
        const { productName, productPrice, quantity, description, category, vendorId, fullName, subCategory, image } = req.body;
        const product = new Product({ productName, productPrice, quantity, description, category, vendorId, fullName, subCategory, image });
        await product.save();
        return res.status(200).send(product);
    } catch (e) {
        return res.status(404).json({ error: e.message });
    }
});

productRouter.get('/api/popular-product', async (req, res) => {
    try {
        const products = await Product.find({ popular: true });
        if (!products || products.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }
        return res.status(200).send(products);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

productRouter.get('/api/recommend-product', async (req, res) => {
    try {
        const products = await Product.find({ recommend: true });
        if (!products || products.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }
        return res.status(200).json(products);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Retrieve products by category name
productRouter.get('/api/product-by-category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category: category, popular: true });

        if (!products || products.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }
        return res.status(200).json(products);
    } catch (e) {
        return res.status(410).json({ error: e.message });
    }
});

// Retrieve related products by subcategory
productRouter.get('/api/related-products-by-subcategory/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // First, find the product to get its subCategory
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ msg: "No product found" });
        }

        // FIX: Corrected `find()` query
        const relatedProducts = await Product.find({
            subCategory: product.subCategory,
            _id: { $ne: productId } // Exclude the current product
        });

        if (!relatedProducts || relatedProducts.length === 0) {
            return res.status(404).json({ msg: "No related products found" });
        }

        // FIX: Corrected `res.status(200).json()`
        return res.status(200).json(relatedProducts);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// route for top 10 high rated product
productRouter.get('/api/top-rated-products', async(req,res)=>{
    try {
         
      const topRatedProduct =  await Product.find({}).sort({averageRating: -1}).limit(2);// sort the product by ascending order(-1) and limit to 10

       if(!topRatedProduct || topRatedProduct.length ==0){
             return res.status(404).json({msg:"not product found"});
       }
       return res.status(200).json(topRatedProduct);
       
    } catch (e) {
       return res.status(500).json({error:e.message});
    }
});

productRouter.get('/api/products-by-subcategory/:subCategory',async (req,res)=>{
    try {
        const {subCategory} = req.params;
        const products = await Product.find({subCategory:subCategory});

        if(products.length ==0 || !products){
            return res.status(404).json({msg:"not Found"});
        }
        return res.status(200).json(products);
    } catch (e) {
         return res.status(500).json({error:e.message});
    }
});


// route for product search by name or description

// productRouter.get('/api/search-products',async(req,res)=>{
//      try {
//          const {query} = req.query;
//          // validate that query
//          //if empty return error 400
//          if(!query){
//             return res.status(400).json({msg:"query is required"});
//          }
//          const products = await Product.find({
            
//             $or:[
//                  // regex to match any substring of of string 
//                  // ex apple match with "oregne apple" , "appleslon fnd"
//                  {productName:{regex:query,options:'i'}},// i stand for case insensitive
//                  {description:{regex:query,options:'i'}}
//             ]
//          });

//          if(products.length ==0 || !products) {
//             return res.status(404).json({msg:"No product Found"});
//          }
//          return res.status(200).json(products);

//      } catch (e) {
//         return res.status(500).json({error:e.message});
//      }

// });
productRouter.get('/api/search-products', async (req, res) => {
    try {
      const { query } = req.query;
  
      // Validate query
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ status: 'error', msg: 'Query is required and must be a string' });
      }
  
      // Escape special regex characters
      const escapeRegex = (string) => {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      };
      const escapedQuery = escapeRegex(query);
  
      // Search products
      const products = await Product.find({
        $or: [
          { productName: { $regex: escapedQuery, $options: 'i' } },
          { description: { $regex: escapedQuery, $options: 'i' } },
        ],
      });
  
      // Handle no products found
      if (products.length === 0) {
        return res.status(404).json({ status: 'error', msg: 'No products found' });
      }
  
      // Return success response
      return res.status(200).json({ status: 'success', data: products });
    } catch (e) {
      console.error(e); // Log the error for debugging
      return res.status(500).json({ status: 'error', error: 'An internal server error occurred' });
    }
  });
productRouter.put('/api/edit-product/:productId',user,vendorAuth, async(req,res)=>{
    try {
        const {productId} = req.params;

       const products =  await Product.find({productId:productId});

       if(products.length ==0 || !products){
        return res.status(404).json({msg:"Not Found product"});
       }
       if(products.vendorId.toString() != req.user.id){
              return res.status(403).json({msg:"Not matched User"})
       }

       // update exclude vendorID
       const {vendorId , ...updateData} = req.body;
       
       // find product with this id and update
       const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {$set:updateData},// update the field
                {new:true}// return the true when succ. updated
       )

       return res.status(200).json(updatedProduct);
        
    } catch (e) {
         return res.status(500).json({error:e.message});
    }
});

module.exports = productRouter;
