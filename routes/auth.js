const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { body, check, validationResult } = require('express-validator')
const { Router } = require('express')
require("dotenv").config()

//REGISTER
router.post('/register', 
    body('fullname').isLength({min: 3}),
    body('email').isEmail(),
    body('password').isLength({min: 8}),
    check('password').exists(),
    check(
        'password2',
        'Confirm password must be the same with the password'
    )
    .exists()
    .custom((value, {req}) => value === req.body.password),
    (req, res) => {
    
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log("errorrrr")
        return res.status(400).json({ errors: errors.array() })
    }

    let {fullname, password, email} = req.body
    
    User.findOne({"email": email}, (err,user) => {
    if(user){
        console.log("user exists")
        return res.status(400).json({msg:"User already exists"})
    } else {
        let user = new User()
        user.fullname = fullname
        user.email = email

        //Hash the password
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(password, salt)
        user.password = hash
        user.save()
        console.log("registered")
        return res.json({msg: "Registered successfully", user})
    }
})
})
// return res.send("Successfully registered!")

//LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body

    User.findOne({email}, (err, user) => {
        if(!user) return res.status(400).json({msg: "User doesn't exist"})
        if(err) return res.status(400).json({err})

        let isMatch = bcrypt.compareSync(password, user.password)

        if(!isMatch) return res.status(400).json({msg:"Invalid credentials"})

        let payload = {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            isAdmin: user.isAdmin
        }

        jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {expiresIn: "1h"},
            (err, token) => {
                if(err) return res.status(400).json({err})
                return res.json({
                    msg: "Logged in successfully",
                    token 
                })
            }
        )
    })
})


module.exports = router