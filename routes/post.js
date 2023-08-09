const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

router.post('/createpost',requireLogin, (req, res) =>{
    const {projectTitle, description, codeLink, websiteLink, documentationLink,thumbnail } = req.body;

    if(!projectTitle || !description){
        return res.status(422).json({error: "Please add all the fields"})
    }

    req.user.password = undefined
    const post = new Post({
        projectTitle,
        description,
        codeLink, 
        websiteLink,
        documentationLink,
        thumbnail,
        postedBy: req.user
    });

    post.save().then(result => {
        res.json({post: result, message:"Post Created successfully"});
    })
    .catch((err) =>{
        console.log(err);
    })

})

router.get('/allpost',requireLogin, (req, res) => {
    Post.find()
    .populate("postedBy","_id name")
    .sort({timeStamp: -1})
    .then(posts => {
        res.json(posts);
    })
    .catch(err => {
        console.log(err);
    })
})

router.get('/mypost',requireLogin, (req, res) =>{
    Post.find({postedBy: req.user._id})
    .populate("postedBy", "_id name")
    .sort({timeStamp: -1})
    .then(myProjects => {
        res.json(myProjects);
    })
    .catch(err => {
        console.log(err);
    })
})

router.get('/detail/:postId',requireLogin, (req, res) =>{
    Post.findOne({_id: req.params.postId})
    .populate("postedBy","name email")
    .then(data => {
        return res.json(data);
    })
    .catch(err => {
        console.log(err);
    })
})

router.put('/like',requireLogin,(req,res)=>{
    console.log(req.body.postId)
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.put('/unlike',requireLogin, (req, res) => {
    console.log(req.body.postId)
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {likes: req.user._id}
    },{
        new: true
    }).exec((err, result)=>{
        if(err){
            return res.status(422).json({error: err})
        }else{
            res.json(result);
        }
    })
})

router.put('/comment',requireLogin, (req, res) => {
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {comments: comment}
    },{
        new: true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err, result)=>{
        if(err){
            return res.status(422).json({error: err})
        }else{
            res.json(result);
        }
    })
})

router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne()
    .populate("postedBy", "_id")
    .exec((err, post) => {
        if(err || !post){
            return res.status(422).json({error: err})
        }

        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result => {
                res.json(result)
            }).catch(err => {
                console.log(err)
            })
        }else{
            console.log(post.postedBy)
            console.log(req.user._id)
            return res.json({err:"No permission to delete"})
        }
        
    })
})
 
module.exports = router