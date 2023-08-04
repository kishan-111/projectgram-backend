const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const PostSchema = new mongoose.Schema({
    projectTitle:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    codeLink:{
        type: String,
        default: "no link"
    },
    websiteLink:{
        type: String,
        default: "no link"
    },
    documentationLink:{
        type: String,
        default: "no link"
    },
    thumbnail:{
        type: String,
        default: "https://images.unsplash.com/photo-1503252947848-7338d3f92f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1031&q=80"
    },
    likes:[{
        type: ObjectId, 
        ref:"User"
    }],
    comments:[{
        text:String,
        postedBy:{
            type:ObjectId,
            ref:"User"
        }
    }],
    timeStamp:{
        type: Date,
        default: Date.now()
    },
    postedBy:{
        type: ObjectId,
        ref:"User"
    }
})

module.exports = mongoose.model('Post', PostSchema);
