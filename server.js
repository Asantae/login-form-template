const env = require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

mongoose.connect(process.env.mongoBase, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())

app.post('/api/change-password', async (req, res) => {
    const { token, newpassword: plainTextPassword } = req.body

    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Password'})
    }

    if (plainTextPassword.length < 5) {
        return res.json({ status: 'error',  error: 'Password must be 6 characters or longer'})
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)
        // ...
        const _id = user.id

        const password = await bcrypt.hash(plainTextPassword, 15)

        await User.updateOne(
            { _id }, 
            {
                $set: { password } 
            }
        )
        res.json({ status: 'ok' })
    } catch(error){
        res.json({ status: 'error', error: 'something has went wrong is the verification process' })
    }
    
    res.json({ status: 'ok' })
    
})

app.post('/api/login', async (req, res) => {

    const { username, password } = req.body
    const user = await User.findOne({ username }).lean()

    if(!user) {
        //the username, password combination does not match anything
        return res.json({ status: 'error', error: 'Invalid username/password' })
    }

    if(await bcrypt.compare(password, user.password)){
        // the username, password combination is successful

        const token = jwt.sign({ 
            id: user._id, 
            username: user.username   
        }, process.env.JWT_SECRET)

        return res.json({ status: 'ok', data: token })
    }

    res.json ({ status: 'ok', error: 'Invalid username/password' })
})

// Client -> Server: Your client *somehow* has to authenticate who it is
// WHY -> Server is a ventral computer which YOU control 
// Client -> a computer which you do not control

// 1. Client proves itself somehow on the request (JWT)
// 2. Client-Server share a secret (cookie)

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    //Analysts
    //Scripts reading databases
    
    const { username, password: plainTextPassword } = req.body

    if(!username || typeof username !== 'string') {
        return res.json({status: 'error', error: 'Invalid Username'})
    }

    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Password'})
    }

    if (plainTextPassword.length < 5) {
        return res.json({ status: 'error',  error: 'Password must be 6 characters or longer'})
    }

    const password = await bcrypt.hash(plainTextPassword, 15)

    try {
        const response = await User.create({
            username,
            password
        })
        console.log("user created successfully", response)
    } catch(error){
        if(error.code === 11000){
            // duplicate key error code is 11000
            return res.json({status: 'error', error: 'This username already exists'})
        }
        throw error
        //line below gives a better representation of the errors we can catch and how we can catch them
        //console.log(JSON.stringify(error))

        console.log(JSON.stringify(error))
    }

    //console.log(await bcrypt.hash(password, 15))
    //bcrypt, md5, sha1, sha256, sha512
    
    //Hashing the passwords

    //SPECIAL_FUNCTION(Password) -> 32jfdalkjsfoajiow43i4akdlf

    //1. The collision should be improbable
    //2. The algorithm should be slow..

    //Always hash passwords especially when managing them yourself
    res.json({ status: 'ok'})
})

app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
})