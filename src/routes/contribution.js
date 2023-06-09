const mongoose = require("mongoose");
const express = require('express');
const route = express.Router();
const Contribution = require('../models/contribution');
const pageNumber = 1; // Specify the desired page number
const pageSize = 10;
route.get('/contributions', async (req, res)=>{
    try{

        const contributions = await Contribution.find({})
        res.status(200).send(contributions);
    }catch(e){
        res.status(500).send();
    }
})

route.get('/contributions/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const contribution = await Contribution.findById(id);
        if(!contribution){
            res.status(404).send();
        }
        res.status(200).send(contribution);
    }catch(e){
        res.status(500).send();
    }
})

route.post('/contributions', async (req, res)=>{
    try{
        const contribution = new Contribution(req.body);;
        await contribution.save();
        res.status(201).send(contribution)
    }catch(e){
        res.status(400).send(e);
    }
})

route.delete('/contributions', async (req, res)=>{
    try{
        await Contribution.deleteMany({});
        res.status(200).send();
    }catch(e){
        res.status(500).send();
    }
})

route.delete('/contributions/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const user = await Contribution.findByIdAndDelete(id);
        if(!user){
            res.status(404).send();
        }
        res.status(200).send(user);
    }catch(e){
        res.status(500).send();
    }
})

route.patch('/contributions/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const user = await Contribution.findByIdAndUpdate(id, req.body, {new: true});
        if(!user){
            res.status(404).send();
        }
        res.status(200).send(user);
    }catch(e){
        res.status(500).send();
    }
})

module.exports = route;