const express = require('express');
const route = express.Router();
const User = require('../models/user');
route.post('/users', async (req, res)=>{
    try{
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user)
    }catch(e){
        res.status(400).send();
    }
})


route.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCreds(req.body.username, req.body.password);
        const token = await user.generateToken();
        res.status(200).send({token, expiresIn:3600});
    }catch(e){
        res.status(401).send({error: {type: 'Error', message:'Invalid username/password'}});
    }
})

module.exports = route;