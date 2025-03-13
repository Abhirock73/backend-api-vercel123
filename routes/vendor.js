const express = require('express');
const Vendor = require('../models/vendor');
const bcrypt = require('bcryptjs');
const vendorRouter = express.Router();
const jwt = require('jsonwebtoken');

vendorRouter.post('/api/vendor/signup',async(req,res)=>{
    try{
      const {fullName,email,password} = await  req.body;

     const exist = await Vendor.findOne({email});
     if(exist){
        return res.status(400).json({msg: "already exist vendor"});
     }
     else{
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password,salt);

         let vendor = new Vendor({fullName,email,password:hashedPassword});
         await vendor.save();
        return  res.json({vendor});
     }

    }catch(e){
        return res.status(500).json("error: e.message");
    }
});

// sign in api

vendorRouter.post('/api/vendor/signin', async(req,res)=>{
    try{
         const {email,password} = req.body;
         const exist = await Vendor.findOne({email});
         if(!exist){
               return res.status(400).json({msg: "this email doesn't exist"});
         }else{
            const check= await bcrypt.compare(password,exist.password);
            
            if(!check)  return res.status(400).json({msg: "wrong password"});
            else{
                 const token = jwt.sign({id:exist._id}, "passwordKey");

                 const {password, ...userWithoutPassword } = exist._doc;

                 return  res.json({token, vendor: userWithoutPassword});
            }
         }

    }catch(e){
          return  res.status(500).json({error: e.message});
    }
});

// fetch all of the vendor-users

vendorRouter.get('/api/vendors',async(req,res)=>{
    try {
      const vendors =  await Vendor.find().select('-password');
      return res.status(200).json(vendors);
    } catch (e) {
      return res.status(404).json({error:e.message});
    }
});
module.exports = vendorRouter;