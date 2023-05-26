const express = require('express');
const { default: mongoose } = require('mongoose');
const _ = require("lodash"); 
const app = express();
require('./db/mongodb')

const contributionSchema = new mongoose.Schema({
    name:{
        type:'String'
    },
    amount:{
        type:'Number'
    }
},{
    timestamps: true
})

contributionSchema.methods.toJSON = function(){
    const user = this;

    const userObject = user.toObject();
    delete userObject._id;
    delete userObject.updatedAt;
    delete userObject.__v;

    return userObject;
}

const Contribution = mongoose.model('Contribution', contributionSchema)


const spendingSchema = new mongoose.Schema({
    item:{
        type:'String'
    },
    count:{
        type:'Number'
    },
    price:{
        type:'Number'
    }
}, {
    timestamps: true
})

spendingSchema.methods.toJSON = function(){
    const user = this;

    const userObject = user.toObject();
    delete userObject._id;
    delete userObject.updatedAt;
    delete userObject.__v;

    return userObject;
}

const Spending = mongoose.model('Spending', spendingSchema)

app.use(express.json());

app.use(cors({
    origin: ["http://localhost:3000", "https://spendingo-app.onrender.com"]
}))

app.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, X-Requested-Width")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE")
    next();
})

app.get('/contributions', async (req, res)=>{
    try{
        const contributions = await Contribution.find({});
        res.status(200).send(contributions);
    }catch(e){
        res.status(500).send();
    }
})

app.post('/contributions', async (req, res)=>{
    try{
        const contribution = new Contribution(req.body);;
        await contribution.save();
        res.status(201).send(contribution)
    }catch(e){
        res.status(400).send(e);
    }
})

app.get('/spendings', async (req, res)=>{
    try{
        const spendings = await Spending.find({});
        res.status(200).send(spendings);
    }catch(e){
        res.status(500).send(e);
    }
})

app.post('/spendings', async (req, res)=>{
    try{
        const contributions = await Contribution.aggregate(
            [
              {
                $group:
                  {
                    _id: null,
                    sum: { $sum: "$amount" }
                  }
              }
            ]
         )

         const spendings = await Spending.aggregate(
            [
              {
                $group:
                  {
                    _id: null,
                    sum: { $sum: "$price" }
                  }
              }
            ]
         )

         const totalFunds = !_.isEmpty(contributions) ? contributions[0].sum : 0;
         const totalSpends = !_.isEmpty(spendings) ? spendings[0].sum : 0;

         if((totalSpends + req.body.price) > totalFunds){
            return res.status(400).send({error: `Funds shortage : ₹${(totalSpends + req.body.price) - totalFunds}`});
         }

        const spending = new Spending(req.body);
        await spending.save();
        res.status(201).send(spending);
    }catch(e){
        res.status(400).send(e);
    }
})

app.listen(3000, ()=>{
    console.log('app is listening on port 3000')
})
