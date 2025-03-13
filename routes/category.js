const express = require('express');
const Category = require('../models/category');

const categoryRouter = express.Router();

categoryRouter.post('/api/category',async(req,res)=>{
       try{
            const {name,image,banner} = req.body;
            const category = new Category({name,image,banner});
            await category.save();
          return  res.status(200).send(category);
       }catch(e){
           return  res.status(404).send({error:e.message});
       }
});
categoryRouter.get('/api/categories',async(req,res)=>{
        try{
            const categories1 = await Category.find();
            return res.status(200).send(categories1);

        }catch(e){
            return res.status(404).json({error : e.message});
        }
});


module.exports = categoryRouter;