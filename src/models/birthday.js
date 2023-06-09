const mongoose = require('mongoose');
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
module.exports = Birthday;