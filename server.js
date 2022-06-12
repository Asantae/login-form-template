const env = require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
mongoose.connect(process.env.mongoBase, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    //Analysts
    //Scripts reading databases
    
    const { username, password: plainTextPassword } = req.body

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
        //line below gives a better representation of the errors we can catch how we can catch them
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