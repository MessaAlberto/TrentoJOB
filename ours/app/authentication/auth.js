const router = require("express").Router();
const User = require("../models/profileModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {registerValidation, loginValidation} = require("./validation");
const express = require("express");
const app = express();

// register
router.post("/register", async (req, res) => {
    // validate data
    const validation = registerValidation(req.body);
    if (validation.error) return res.status(400).send({err: validation.error.details[0].message});

    // check if email already exists
    const emailExists = await User.findOne({email: req.body.email}, 'email', null);
    if (emailExists) return res.status(400).send('Email already exists');

    // salt
    const salt = await bcrypt.genSalt(10);
    // hash
    const hash = await bcrypt.hash(req.body.password, salt);

    let user = new User(req.body);
    user.password = hash;

    // save
    try {
        const  savedUser = await user.save();
        res.status(201).send({user: savedUser._id});
        app.redirect('/login.html');
    } catch (err) {
        res.status(400).send(err)
    }
});

// login
router.post('/login', async (req, res) => {
    // validate data
    const validation = loginValidation(req.body);
    if (validation.error) return res.status(400).send('Email or password is wrong'); // {err: validation.error.details[0].message}

    // email doesnt exist
    const user = await User.findOne({email: req.body.email}, {_id: 1, password: 1}, null);
    if (!user) return res.status(400).send('Email or password is wrong');

    // password wrong
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Email or password is wrong');

    // logged
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET); // TODO jwt_secret save
    res.header('auth-token').send(token);
    app.redirect('/home.html');
    // TODO role handling
});