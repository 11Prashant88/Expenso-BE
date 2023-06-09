const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
module.exports = User;