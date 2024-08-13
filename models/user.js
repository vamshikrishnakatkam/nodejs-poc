const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    fname:{
        type: String,
        required:true,
        min:6,
        max:255
    },
    email:{
        type: String,
        required:true,
        min:6,
        max:255
    },
    password:{
        type: String,
        required:true,
        min:6,
        max:25, 
    }
})

const User=new mongoose.model('User',userSchema)
module.exports=User;