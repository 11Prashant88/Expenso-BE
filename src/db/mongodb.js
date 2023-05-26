const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prashantzende:A60vq2DirwDuJxHs@cluster0.5rtteqz.mongodb.net/SpendingoDB?retryWrites=true&w=majority', {useNewUrlParser: true}).then(()=>{
    console.log('app connected to mongodb server successfully');
}).catch((e)=>{
    console.log(e)
})