const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const requireLogin = require('../middleware/requireLogin')

const jwtSecret = process.env.JWT_SECRET

router.post('/signup', (req, res) =>{
    const {name, email, password} = req.body;
    if(!email || !password ||!name){
        return res.status(422).json({error: "Please add all the fields"})  
    }
    User.findOne({email:email})
    .then((savedUser) => {
        if(savedUser){
            return res.status(422).json({error: "User already exist with the email"})
        }
        bcrypt.hash(password, 12)
        .then(hashedpassword =>{
            const user = new User({
                email,
                password: hashedpassword,
                name
            })
    
            user.save()
            .then(user => {
                res.json({message: "Signup successfully"})
            })
            .catch(err => {
                console.log(err);
            })
        })
        
    })
    .catch(err => {
        console.log(err);
    })
})

router.post('/signin', (req, res) => {
    const {email, password} = req.body;
    
    if(!email || !password){
        return res.status(422).json({error: "Please fill all the fields"})
    }

    User.findOne({email: email})
    .then(savedUser => {
        if(!savedUser){
            return res.status(422).json({error: "Invalid Email or Password"})
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch){
                const token = jwt.sign({_id: savedUser._id}, jwtSecret)
                const {_id, name, email, followers, following} = savedUser;
                res.json({token, user: {_id, name, email, followers, following}, message:"Signed in successfully"});
            }else{
                return res.status(422).json({error: "Invalid Email or Password"});
            }
        })
        .catch(err => {
            console.log(err);
        })
    })
})
module.exports = router;