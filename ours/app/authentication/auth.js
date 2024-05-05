const router = require("express").Router();
const User = require("../models/profileModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {registerValidation, loginValidation} = require("./validation");
const express = require("express");
const app = express();
const mail = require("../nodeMail");

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
    const savedUser = await user.save().
    then ( () => {
        res.status(201).send({user: savedUser._id});
        app.redirect('/login.html');
    }).
    catch(err => {
        return res.status(400).send(err);
    });

    // send email confirmation mail
     jwt.sign({_id: savedUser._id}, process.env.JWT_MAIL_SECRET, {expiresIn: '2d'},
         (err, token) => {
         const url = `http://localhost:3000/confirmation/${token}`;
         const html = `link valid for 48h: <a href="${url}">Click here to confirm</a>`;
         mail(req.body.email, "Email confirmation", html);
     });
});

// login
router.post('/login', async (req, res) => {
    // validate data
    const validation = loginValidation(req.body);
    if (validation.error) return res.status(400).send('Email or password is wrong'); // {err: validation.error.details[0].message}

    const user = await User.findOne({email: req.body.email}, {_id: 1, password: 1, confirmed: 1}, null);
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    // email doesn't exist or password is wrong
    if (!user || !validPassword) return res.status(400).send('Email or password is wrong');
    // email not confirmed
    if (!user.confirmed) return  res.status(400).send('Email was not confirmed');

    // logged
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET); // TODO jwt_secret save
    res.header('auth-token').send(token);
    app.redirect('../home.html');
    // TODO role handling
});

// confirm mail
router.get('/confirmation/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const {_id: { id } } = jwt.verify(token, process.env.JWT_MAIL_SECRET);
        res.status(200).send('You have been verified');
        User.findByIdAndUpdate(id, {confirmed: true}, null);

        const user_email = User.findById(id, {email: 1}, null);
        mail(user_email, "Welcome to TrentoJob", `welcome to our platform,\nour crew is happy to have you on board.\nwe hope you'll have great opportunities`);
    } catch (err) {
        res.status(401).send('somthing went wrong');
        // delete document since it wasn't verified  before deadline
        if (err === 'TokenExpiredError') {
            let id = jwt.decode(token, process.env.JWT_MAIL_SECRET).payload._id;
            User.findByIdAndDelete(id, null);
        }
    }
    app.redirect('/login.html');
})