const express = require('express');
const route = express.Router();
const Expense = require('../models/expense');
route.get('/expenses', async (req, res)=>{
    try{
        const expenses = await Expense.find({});
        res.status(200).send(expenses);
    }catch(e){
        res.status(500).send(e);
    }
})

route.get('/expenses/:id', async (req, res)=>{
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

route.post('/expenses', async (req, res)=>{
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

route.delete('/expenses', async (req, res)=>{
    try{
        await Expense.deleteMany({});
        res.status(200).send();
    }catch(e){
        res.status(500).send();
    }
})

route.delete('/expenses/:id', async (req, res)=>{
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

route.patch('/expenses/:id', async (req, res)=>{
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

module.exports = route