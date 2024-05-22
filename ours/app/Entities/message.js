// Route to handle requests for /message
const router = require('express').Router();
const {Chat} = require("../models/chatModel");
const {Profile} = require("../models/profileModel");
const {messageValidation} = require("../validation");
const {Message} = require("../models/subModels");

// new message
router.post('/:id', messageValidation, async (req, res) => {
    try {
        // no message
        if (!req.body)
            return res.status(400).send("Bad Request");

        // must be logged in
        if (!req.user)
            return res.status(403).send("Not logged in");

        const chat = await Chat.findById(req.params.id);

        // must be part of the chat
        const id = req.user._id.toString();

        if (!chat || (id !== chat.memberA.id && id !== chat.memberB.id))
            return res.status(400).json({message: "Bad Request"});

        // new message
        const message = {
            sender: {
                username: req.user.username,
                id: id,
            },
            text: req.body.text,
        };

        // add message
        await Chat.findByIdAndUpdate(req.params.id,
            {$push: {messages: message}});

        // add notification
        const otherMemberId = id === chat.memberA.id ? chat.memberB.id : chat.memberA.id;

        await Profile.findByIdAndUpdate(
            otherMemberId,
            {$inc: { 'chats.$[elem].new': 1 } },
            {arrayFilters: [{ 'elem.id': chat._id }]});

        res.status(200).json({message: 'message sent'});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

module.exports = router;