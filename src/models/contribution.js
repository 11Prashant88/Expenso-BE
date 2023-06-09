const mongoose = require('mongoose');
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
module.exports = Contribution;