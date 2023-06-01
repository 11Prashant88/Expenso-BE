const express = require('express');
var cors = require('cors');
const { default: mongoose } = require('mongoose');
const _ = require("lodash"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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


const expenseSchema = new mongoose.Schema({
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

expenseSchema.methods.toJSON = function(){
    const user = this;

    const userObject = user.toObject();
    delete userObject._id;
    delete userObject.updatedAt;
    delete userObject.__v;

    return userObject;
}

const Expense = mongoose.model('Expense', expenseSchema)


const userSchema = new mongoose.Schema(
    {
        username: {
            type: 'String'
        },
        password:{
            type:'String'
        },
        tokens:[{
            token:{
                type: String
            }
        }]
    }
)

userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.statics.findByCreds = async (username, password)=>{
    const user = await User.findOne({username});
    if(!user){
        throw new Error('invalid Creds');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if(!isValidPassword){
        throw new Error('invalid Creds');
    }
    return user;
}

userSchema.methods.generateToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, 'thisismysecret', {expiresIn: '1h'});
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token
}

const User = mongoose.model('User', userSchema);

app.use(express.json());

app.use(cors({
    origin: ["http://localhost:4200", "https://expenso.onrender.com"]
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

app.delete('/contributions', async (req, res)=>{
    try{
        await Contribution.deleteMany({});
        res.status(200).send();
    }catch(e){
        res.status(500).send();
    }
})

app.get('/expenses', async (req, res)=>{
    try{
        const expenses = await Expense.find({});
        res.status(200).send(expenses);
    }catch(e){
        res.status(500).send(e);
    }
})

app.post('/expenses', async (req, res)=>{
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

         const expenses = await Expense.aggregate(
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
         const totalExpenses = !_.isEmpty(expenses) ? expenses[0].sum : 0;

         if((totalExpenses + req.body.price) > totalFunds){
            return res.status(400).send({error: `Funds shortage : ₹${(totalExpenses + req.body.price) - totalFunds}`});
         }

        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).send(expense);
    }catch(e){
        res.status(400).send(e);
    }
})

app.delete('/expenses', async (req, res)=>{
    try{
        await Expense.deleteMany({});
        res.status(200).send();
    }catch(e){
        res.status(500).send();
    }
})

app.post('/users', async (req, res)=>{
    try{
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user)
    }catch(e){
        res.status(400).send();
    }
})

app.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCreds(req.body.username, req.body.password);
        const token = await user.generateToken();
        res.status(200).send({token, expiresIn:3600});
    }catch(e){
        res.status(401).send({error: {type: 'Error', message:'Invalid username/password'}});
    }
})

app.listen(3000, ()=>{
    console.log('app is listening on port 3000')
})
