const express = require('express');
const User = require('../models/user');
const Vendor = require('../models/vendor');
const bcrypt = require('bcryptjs');
const authRoutes = express.Router();
const jwt = require('jsonwebtoken');
const {user} = require('../middleware/auth');

// const {dbconnect()}=require('../index')


authRoutes.post('/api/signup',async(req,res)=>{
      try{
        const {fullName,email,password} = await  req.body;

       const exist = await User.findOne({email});
       const existVendor = await Vendor.findOne({email});
       if(exist || existVendor){
          return res.status(400).json({msg: "already exist user"});
       }
       else{
           const salt = await bcrypt.genSalt(10);
           const hashedPassword = await bcrypt.hash(password,salt);

           let user = new User({fullName,email,password:hashedPassword});
           await user.save();
          return  res.json({user});
       }

      }catch(e){
          return res.status(500).json({error: e.message});
      }
});
// sign in api

authRoutes.post('/api/signIn', async(req,res)=>{
       try{
            const {email,password} = req.body;

            const exist = await User.findOne({email});

            if(!exist){
                  return res.status(400).json({msg: "this email doesn't exist"});
            }else{
               const check= await bcrypt.compare(password,exist.password);
               
               if(!check)  return res.status(400).json({msg: "wrong password"});
               else{
                    const token = jwt.sign({id:exist._id},/*process.env.JWT_TOKEN*/"passwordKey", {expiresIn: '300m'});

                    const {password, ...userWithoutPassword } =exist._doc;

                    return  res.json({token,  userWithoutPassword});
               }
            }

       }catch(e){
             return  res.status(500).json({error: e.message});
       }
});

// check for toke
authRoutes.post('/tokenIsValid', async (req, res) => {
      try {
            const token = req.header("x-auth-token");
            if (!token) return res.json(false); // No token provided

            // Verify the token
            const verified = jwt.verify(token,  "passwordKey");
            if (!verified) return res.json(false); // Token is invalid

            // Check if the user exists
            const person = await User.findById(verified.id);
            if (!person) return res.json(false); // User not found

            // Token is valid and user exists
            return res.json(true);
      } catch (e) {
            // Handle errors (e.g., invalid token, server error)
            return res.status(500).json({ error: e.message });
      }
});

// define the get route for authentication router
authRoutes.get('/',user , async(req,res)=>{
      try {
           // retrieve the user data from database using the id from the authenticated user 
           const Person = await User.findById(req.user);
           // send the user data in json format including token
           return res.json({...user._doc,token: req.token});

      } catch (e) {
            return res.status(500).json({error:e.message});
      }
});

authRoutes.put('/api/users/:id', async(req,res)=>{
            try {
                  // extract id from req url
                  const {id} = req.params;

                  // extract "state", "city", "locality" from req body
                  const {state,city,locality} = req.body;

                  // find user by their id and update detail
                  // the {new:true} option ensure the updated returned
                  const updatedUser = await User.findByIdAndUpdate(
                        id,
                        {state,city,locality},
                        {new:true},
                  );

                  if(!updatedUser){
                        return res.status(400).json({msg: "user not found"});
                  }
                  return res.status(200).json(updatedUser);


            } catch (e) {
                  return res.status(400).json({error : e.message});
            }
});
authRoutes.put('/api/users/:id', async(req,res)=>{
            try {
                  // extract id from req url
                  const {id} = req.params;

                  // extract "state", "city", "locality" from req body
                  const {state,city,locality} = req.body;

                  // find user by their id and update detail
                  // the {new:true} option ensure the updated returned
                  const updatedUser = await User.findByIdAndUpdate(
                        id,
                        {state,city,locality},
                        {new:true},
                  );

                  if(!updatedUser){
                        return res.status(400).json({msg: "user not found"});
                  }
                  return res.status(200).json(updatedUser);


            } catch (e) {
                  return res.status(400).json({error : e.message});
            }
});



// fetch all of the users

authRoutes.get('/api/users',async(req,res)=>{
    try {
      const users =  await User.find().select('-password');
      return res.status(200).json(users);
    } catch (e) {
      return res.status(404).json({error:e.message});
    }
});



authRoutes.delete('/api/user/delete-account/:id', user,async(req,res)=>{
      try {
            // extract id from body
            const {id} = req.params;
            const user1 = await User.findById(id);
            const user2 = await Vendor.findById(id);

            if(!user1 && !user2){
                  return res.status(404).json({msg:"No such User Found"});
            }
            if(user1){
                  await User.findByIdAndDelete(id);
            }
            else if(user2){
                  await Vendor.findByIdAndDelete(id);
            }
            return res.status(200).json({msg:"Successfully deleted"});

      } catch (e) {
            return res.status(500).json({error:e.message});
      }
});

module.exports = authRoutes;
