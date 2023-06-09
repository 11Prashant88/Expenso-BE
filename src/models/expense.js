const mongoose = require('mongoose');
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
module.exports = Expense;