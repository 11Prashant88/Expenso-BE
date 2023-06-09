const express = require('express');
var cors = require('cors');
const contributionRoutes = require('./routes/contribution');
const expenseRoutes = require('./routes/expense');
const birthdayRoutes = require('./routes/birthday');
const userRoutes = require('./routes/user');
const _ = require("lodash"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
require('./db/mongodb')

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

app.use(contributionRoutes);
app.use(expenseRoutes);
app.use(birthdayRoutes);
app.use(userRoutes);

app.listen(3000, ()=>{
    console.log('app is listening on port 3000')
})
