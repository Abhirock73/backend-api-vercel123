const express = require('express');
const subCategory = require('../models/sub_category');

const categoryRouter = express.Router();
categoryRouter.post('/api/subcategories',async (req,res)=>{
    try{
       const {categoryId,categoryName,image,subCategoryName} =req.body;
      const subCategories= new subCategory({categoryId,categoryName,image,subCategoryName});
      await subCategories.save();
      return res.status(200).send(subCategories);
    }catch(e){
      return  res.status(200).json( {error: e.message} );
    } 
});



categoryRouter.get('/api/subcategories',async (req,res)=>{
     try{
         const subcategories= await subCategory.find();
         res.status(200).json(subcategories);
     }catch(e){
      return  res.status(200).json( {error: e.message} );
     }
});






categoryRouter.get('/api/category/:categoryName/subcategories',async (req,res)=>{
     try{
        //extract catName from url
        const {categoryName} = req.params;
        const p= await subCategory.find({categoryName:categoryName});
        if(!p || p.length==0){
          return  res.status(410).json({msg:"subCategory not found"});
        }
        else{
            return res.status(200).json(p);
        }
     }catch(e){
        return res.status(404).json({error:e.message});
     }
});
module.exports = categoryRouter;