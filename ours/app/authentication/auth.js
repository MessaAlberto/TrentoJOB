const router = require("express").Router();
const {compare} = require("bcrypt");
const {sign, verify, decode} = require("jsonwebtoken");
const {Profile} = require("../models/profileModel");
const mail = require("../nodeMail");
const {loginValidation} = require("../validation");

// login
router.post('/', loginValidation, async (req, res) => {
    try {
        // Find user by email
        const user = await Profile.findOne({ email: req.body.email });

        // If user doesn't exist or password is wrong
        if (!user || !(await compare(req.body.password, user.password)))
            return res.status(400).json({message: 'Email or password is wrong'});

        // If email is not confirmed
        if (!user.confirmed)
            return res.status(400).json({message: 'Email was not confirmed'});

        // if organization require verification by admin
        if (user.role === 'organisation' && !user.verified)
            return res.status(401).json({message: "this account hasn't been verified yet"});

        // logged
        const token = sign({_id: user._id}, process.env.JWT_SECRET_TOKEN, {expiresIn: process.env.JWT_EXPIRE_TOKEN});
        const new_refresh_token = sign({_id: user._id}, process.env.JWT_SECRET_REFRESH, {expiresIn: process.env.JWT_EXPIRE_REFRESH});

        await Profile.findByIdAndUpdate(user._id, {refresh_token: new_refresh_token});

        res.
        status(200).
        cookie("refresh_token", new_refresh_token, {httpOnly: true}).
        json({
            message: 'Login successfully',
            userId: user._id,
            username: user.username,
            role: user.role,
            token: token,
        });

    } catch {
        res.status(400).json({message: 'Internal Server Error, please retry'});
    }
});

// refresh token
router.get("/", async (req, res) => {
    try {
        const {refresh_token} = req.cookies;
        if (!refresh_token)
            return res.status(401).json({message: "Missing refresh token"})

        // get id from token
        const id = verify(refresh_token, process.env.JWT_SECRET_REFRESH)._id;
        if (!id)
            return res.status(403);

        // get user
        const user = await Profile.findById(id);
        if (!user)
            return res.status(404).json({message: "User not found"});

        if (user.refresh_token !== refresh_token)
            return res.status(403);

        // The refresh token is correct => renew token
        const new_token = sign({_id: user._id}, process.env.JWT_SECRET_TOKEN, {expiresIn: process.env.JWT_EXPIRE_TOKEN});

        res.status(200).json({
            message: "Token refreshed",
            id: user._id,
            token: new_token,
        });

    } catch (err) {
        res.status(500).json({
            message: "Error refreshing token",
            err
        })
    }
})

// confirm mail
router.get('/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const data = verify(token, process.env.JWT_SECRET_MAIL);
        const user = await Profile.findByIdAndUpdate(data._id, {confirmed: true});
        res.status(200).json({message: 'You have been verified'});

        // mail
        if (user.role === 'user') {
            mail(user.email, "Welcome to TrentoJob", `welcome to our platform, our crew is happy to have you on board. We hope you'll have great opportunities`);
        } else {
            mail(user.email, "Almost there", "Welcome to TrentoJOB, our crew is verifying your data, we'll notify you when your account is ready");
            // TODO NOTIFY AMM
        }
    } catch (err) {
        // delete document since it wasn't verified  before deadline
        if (err === 'TokenExpiredError') {
            let id = decode(token, process.env.JWT_SECRET_MAIL).payload._id;
            await Profile.findByIdAndDelete(id);
        }

        res.status(500).json({message: 'something went wrong, please retry signup'});
    }
})

// logout
router.delete('/',  async (req, res) => {
    // makes refresh impossible without login
    Profile.findByIdAndUpdate(req.body._id, {refresh_token: null});
    return res.status(200).json({message: 'Logout successfully'});
})



module.exports = router;