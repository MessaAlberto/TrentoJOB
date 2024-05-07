const {Profile, User, Organisation} = require("../models/profileModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {registerValidation, loginValidation} = require("./validation");
const router = require("express").Router();
const mail = require("../nodeMail");

// register
router.post("/register", async (req, res) => {
    // validate data
    const validation = registerValidation(req.body);
    if (validation.error) return res.status(400).send(validation.error);
    console.log("bella");

    // check if email already exists
    const emailExists = await Profile.findOne({email: req.body.email})
    if (emailExists) return res.status(400).send('Email already exists');

    // salt
    const salt = await bcrypt.genSalt(10);
    // hashing
    req.body.password = await bcrypt.hash(req.body.password, salt);

    let user = new (req.body.taxIdCode ? Organisation : User)(req.body);
    user.role = req.body.taxIdCode ? 'organization' : 'user';

    // save
    await user.save().
    then ( savedUser => {
        res.status(201).send({user: savedUser._id});
        // send email confirmation mail
        jwt.sign({_id: savedUser._id}, process.env.JWT_MAIL_SECRET, {expiresIn: '2d'},
        (err, token) => {
            const url = `http://localhost:${process.env.PORT}/auth/confirmation/${token}`;
            const html = `link valid for 48h: <a href="${url}">Click here to confirm</a>`;
            mail(req.body.email, "Email confirmation", html);
        });
    }).
    catch(err => {
        console.log(err);
        return res.status(400).send('err4');
    });
});

// confirm mail
router.get('/confirmation/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const data = jwt.verify(token, process.env.JWT_MAIL_SECRET);
        res.status(200).send('You have been verified');
        await Profile.findByIdAndUpdate(data._id, {confirmed: true});
        await Profile.findById(data._id, {email: 1, role: 1}).
        then(user => {
            if (user.role === 'user') {
                mail(user.email, "Welcome to TrentoJob", `welcome to our platform, our crew is happy to have you on board. We hope you'll have great opportunities`);
            } else {
                mail(user.email, "almost there", "Welcome to TrentoJOB, our crew is verifing your data, we'll notify you when your account is ready");
            }
        }).catch(() => {
            res.status(401).send('Access denied');
        })
    } catch (err) {
        res.status(401).send('somthing went wrong');
        // delete document since it wasn't verified  before deadline
        if (err === 'TokenExpiredError') {
            let id = jwt.decode(token, process.env.JWT_MAIL_SECRET).payload._id;
            await Profile.findByIdAndDelete(id);
        }
    }
})

// login
router.post('/login', async (req, res) => {
    // validate data
    const validation = loginValidation(req.body);
    if (validation.error) return res.status(400).send('Email or password is wrong'); // {err: validation.error.details[0].message}

    const user = await Profile.findOne({email: req.body.email}).
    catch(() => {
        return res.status(400).send('Email or password is wrong');
    });
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    // email doesn't exist or password is wrong
    if (!user || !validPassword) return res.status(400).send('Email or password is wrong');
    // email not confirmed
    if (!user.confirmed) return  res.status(400).send('Email was not confirmed');

    // logged
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
    res.header('auth-token').send(token);
});

module.exports = router;