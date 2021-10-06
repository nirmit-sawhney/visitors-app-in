const mongoose=require('mongoose');

const visitorSchema=mongoose.Schema({
    username:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true
    },
    checkedin:{
        type:String,
        trim:true
    },
    status:{
        type:String,
        trim:true
    },
    checkedout:{
        type:String,
        trim:true
    }
})

const visitor=mongoose.model('visitor',visitorSchema);

module.exports=visitor;