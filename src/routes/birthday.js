const express = require('express');
const Birthday = require('../models/birthday');
const route = express.Router();
route.get('/birthdays', async (req, res)=>{
    try{
        const birthdays = await Birthday.find({});
        res.status(200).send(birthdays);
    }catch(e){
        res.status(500).send();
    } 
})

route.get('/birthdays/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const birthday = await Birthday.findOne({_id: id});
        if(!birthday){
            res.status(404).send();
        }
        res.status(200).send(birthday);
    }catch(e){
        res.status(500).send();
    } 
})

route.post('/birthdays', async (req, res)=>{
    try{
        const payload = {...req.body, dob: new Date(req.body.dob)}
        const birthday = new Birthday(req.body);;
        await birthday.save();
        res.status(201).send(birthday)
    }catch(e){
        res.status(400).send(e);
    }
})

route.patch('/birthdays/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const birthday = await Birthday.findByIdAndUpdate(id, req.body, {new: true});
        if(!birthday){
            res.status(404).send();
        }
        res.status(200).send(birthday);
    }catch(e){
        res.status(500).send();
    }
})

route.delete('/birthdays/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const birthday = await Birthday.findByIdAndDelete(id);
        if(!birthday){
            res.status(404).send();
        }
        res.status(200).send(birthday);
    }catch(e){
        res.status(500).send();
    }
})

module.exports = route