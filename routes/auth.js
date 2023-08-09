const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
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

router.post('/reset-password', (req, res)=>{
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
           return res.send({error});
        }
        const token = buffer.toString("hex")
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                return res.status(422).json({error: "User dont exist with this email"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result) => {
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    logger: true,
                    port: 465,
                    debug: true,
                    secureConnection: false,
                    auth:{
                        user:'projectgraam@gmail.com',
                        pass: 'nocqhpuksvajstqn'
                    },
                    tls:{
                        rejectUnauthorized: true
                    }
                });

                var mailOptions = {
                    from: 'no-reply@projectgram.com',
                    to:'kishankr7909@gmail.com',
                    subject: 'Reset-Password Request',
                    html: `
                    <p>Your reset-password Link</p>
                    <h5><a href = "http://localhost:3000/reset/${token}">Click Here</a></h5>`
                };
            
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return res.send({error: error});
                    }else{
                        return res.send({message: 'Email Sent: ' + info.response});
                    }
                })
            })
        })
    })
})

router.post('/new-password', (req, res) => {
    const newPassword = req.body.password;
    const sentToken = req.body.token;
    
    User.findOne({resetToken:sentToken, expireToken:{$gt:Date.now()}})
    .then(user =>{
        if(!user){
            return res.status(422).json({error: "Try again session expired"})
        }
        bcrypt.hash(newPassword, 12).then(hashedpassword => {
            user.password = hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then((saveduser) => {
                return res.json({message: "Password updated success"})
            })
        }).catch(err => {
            return res.json({error: err})
        })

    })
})
module.exports = router;