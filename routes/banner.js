const express = require('express');
const Banner = require('../models/banner');
const bannerRouter= express.Router();

bannerRouter.post('/api/banner',async(req,res)=>{
    console.log(req.body)
    try{
        const {image} = await req.body;
        const banner =new Banner({image});
        await banner.save();
        return res.status(201).send(banner);
      
    }catch(e){
       return  res.status(500).json({error: e.message});

    }
});
bannerRouter.get('/api/banner1',async(req,res)=>{
       try{
        const banners = await Banner.find();
       return res.status(200).send(banners);

       }catch(e){
        return res.status(404).send({error:e.message});
       }

});
module.exports = bannerRouter;