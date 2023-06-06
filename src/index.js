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
    userObject['id'] = userObject._id;
    delete userObject._id;
    delete userObject.updatedAt;
    delete userObject.__v;

    return userObject;
}

const Contribution = mongoose.model('Contribution', contributionSchema)




const birthdaySchema = new mongoose.Schema({
    name:{
        type:'String'
    },
    dob:{
        type:'Date'
    }
},{
    timestamps: true
})

birthdaySchema.methods.toJSON = function(){
    const user = this;

    const userObject = user.toObject();
    userObject['id'] = userObject._id;
    delete userObject._id;
    delete userObject.updatedAt;
    delete userObject.__v;

    return userObject;
}

const Birthday = mongoose.model('Birthday', birthdaySchema)



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
    userObject['id'] = userObject._id;
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

app.get('/contributions/:id', async (req, res)=>{
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

app.delete('/contributions/:id', async (req, res)=>{
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

app.patch('/contributions/:id', async (req, res)=>{
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

app.get('/expenses', async (req, res)=>{
    try{
        const expenses = await Expense.find({});
        res.status(200).send(expenses);
    }catch(e){
        res.status(500).send(e);
    }
})

app.get('/expenses/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const expense = await Expense.findById(id);
        if(!expense){
            res.status(404).send();
        }
        res.status(200).send(expense);
    }catch(e){
        res.status(500).send();
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

app.delete('/expenses/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const expense = await Expense.findByIdAndDelete(id);
        if(!expense){
            res.status(404).send();
        }
        res.status(200).send(expense);
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
app.patch('/expenses/:id', async (req, res)=>{
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
    const id = req.params.id;
    try{
        const expense = await Expense.findByIdAndUpdate(id, req.body, {new: true});
        if(!expense){
            res.status(404).send();
        }
        res.status(200).send(expense);
    }catch(e){
        res.status(500).send();
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

app.get('/birthdays', async (req, res)=>{
    try{
        const birthdays = await Birthday.find({});
        res.status(200).send(birthdays);
    }catch(e){
        res.status(500).send();
    } 
})

app.get('/birthdays/:id', async (req, res)=>{
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

app.post('/birthdays', async (req, res)=>{
    try{
        const payload = {...req.body, dob: new Date(req.body.dob)}
        const birthday = new Birthday(req.body);;
        await birthday.save();
        res.status(201).send(birthday)
    }catch(e){
        res.status(400).send(e);
    }
})

app.patch('/birthdays/:id', async (req, res)=>{
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

app.delete('/birthdays/:id', async (req, res)=>{
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

app.listen(3000, ()=>{
    console.log('app is listening on port 3000')
})
