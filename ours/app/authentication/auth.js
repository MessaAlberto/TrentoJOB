const router = require("express").Router();
const {hash, compare} = require("bcrypt");
const {sign, verify, decode} = require("jsonwebtoken");
const {Profile, User, Organisation} = require("../models/profileModel");
const {registerValidation, loginValidation} = require("./validation");
const mail = require("../nodeMail");
const {verifyToken} = require("verifyToken");


// register
router.post("/register", async (req, res) => {
    // validate data
    const validation = registerValidation(req.body);
    if (validation.error) return res.status(400).json({message: 'err1'});

    // check if email already exists
    const emailExists = await Profile.findOne({email: req.body.email})
    if (emailExists) return res.status(400).json({message: 'Email already exists'});

    // hashing
    req.body.password = await hash(req.body.password, 10);
    let user = new (req.body.taxIdCode ? Organisation : User)(req.body);
    user.role = req.body.taxIdCode ? 'organization' : 'user';

    // save
    try {
        const savedUser = await user.save();
        res.status(201).json({user: savedUser._id});
        // send email confirmation mail
        const email_token = sign({_id: savedUser._id}, process.env.JWT_SECRET_MAIL, {expiresIn: process.env.JWT_EXPIRE_MAIL});
        const url = `http://localhost:${process.env.PORT}/auth/confirmation/${email_token}`;
        const html = `link valid for 48h: <a href="${url}">Click here to confirm</a>`;
        mail(req.body.email, "Email confirmation", html);
    } catch {
        res.status(400).json({message: 'err4'});
    }
});

// confirm mail
router.get('/confirmation/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const data = verify(token, process.env.JWT_SECRET_MAIL);
        res.status(200).json({message: 'You have been verified'});
        await Profile.findById(data._id, {email: 1, role: 1}).
        then(async user => {
            await Profile.findByIdAndUpdate(data._id, {confirmed: true});
            if (user.role === 'user') {
                mail(user.email, "Welcome to TrentoJob", `welcome to our platform, our crew is happy to have you on board. We hope you'll have great opportunities`);
            } else {
                mail(user.email, "almost there", "Welcome to TrentoJOB, our crew is verifing your data, we'll notify you when your account is ready");
            }
        }).catch(() => {
            res.status(401).json({message: 'Access denied'});
        })
    } catch (err) {
        // delete document since it wasn't verified  before deadline
        if (err === 'TokenExpiredError') {
            let id = decode(token, process.env.JWT_SECRET_MAIL).payload._id;
            await Profile.findByIdAndDelete(id);
        }

        res.status(401).json({message: 'somthing went wrong, please retry signup'});
    }
})

// login
router.post('/login', async (req, res) => {
    // Validate data
    const validation = loginValidation(req.body);
    if (validation.error)
        return res.status(400).json({message: 'Email or password is wrong'});

    try {
        // Find user by email
        const user = await Profile.findOne({ email: req.body.email });

        // If user doesn't exist or password is wrong
        if (!user || !(await compare(req.body.password, user.password)))
            return res.status(400).json({message: 'Email or password is wrong'});

        // If email is not confirmed
        if (!user.confirmed)
            return res.status(400).json({message: 'Email was not confirmed'});

        // if orgnaization require verification by admin
        if (user.role === 'organisation' && !user.verified)
            return res.status(401).json({message: "this account hasn't been verified yet"});

        // logged
        const token = sign({_id: user._id}, process.env.JWT_SECRET_TOKEN, process.env.JWT_EXPIRE_TOKEN);
        const new_refresh_token = sign({_id: user._id}, process.env.JWT_SECRET_REFRESH, process.env.JWT_EXPIRE_REFRESH);

        Profile.findByIdAndUpdate(user._id, {refresh_token: new_refresh_token});

        res.status(200).json({
            message: 'Login successfully',
            user: user._id,
            token: token,
        });

    } catch {
        res.status(400).json({message: 'Internal Server Error, please retry'});
    }
});

// logout
router.post('/logout', verifyToken,  async (req, res) => {
    // makes refresh impossible without login
    Profile.findByIdAndUpdate(req.body._id, {refresh_token: null});
    res.status(200).json({message: 'Logout successfully'});
})

// refresh token
router.get("/refresh_token", async (req, res) => {
    try {
        // get id from refresh token
        const id = await decode(req.body.token, process.env.JWT_SECRET_REFRESH).payload._id;

        if (!id)
            return res.status(500).json({message: "Invalid token"});

        // get user
        const user = await Profile.findById(id);

        if (!user)
            return res.status(500).json({message: "User not found"});

        // verify refresh token
        await verify(user.refresh_token, process.env.JWT_SECRET_REFRESH).
        catch (() => {
            return res.status(401).json({message: "Invalid refresh token, sign in to get a new one"});
        });

        // The refresh token is correct => renew token
        const new_token = sign({_id: user._id}, process.env.JWT_SECRET_TOKEN, process.env.JWT_EXPIRE_TOKEN);

        res.status(200).json({
            message: "Token refreshed",
            user: user._id,
            token: new_token,
        });

    } catch (err) {
        res.status(500).json({
            message: "Error refreshing token",
            err
        })
    }

})



module.exports = router;