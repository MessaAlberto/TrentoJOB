// Route to handle requests for /chat
const router = require('express').Router();
const {Chat} = require("../models/chatModel");
const {privateChat} = require("../middleware");
const {Profile} = require("../models/profileModel");

// create chat
router.post('/:id', async (req, res) => {
    try {
        // must be logged in
        if (!req.user)
            return res.status(403).send("Not logged in");

        const id = req.user._id.toString();

        const memberB = await Profile.findById(req.params.id).select('username');

        // must exist and not be self
        if (!memberB || id === req.params.id)
            return res.status(400).json({message: "Bad Request"});

        // new chat
        let newChat = new Chat;
        newChat.memberA = {username: req.user.username, id: id};
        newChat.memberB = {username: memberB.username, id: req.params.id};
        const savedChat = await newChat.save();

        const chatId = savedChat._id.toString();

        // status update on the user side
        const statusA = {
            id: chatId,
            other: newChat.memberB,
        }
        // add chat to profile A
        await Profile.findByIdAndUpdate(id,
            {$push: {chats: statusA}});

        const statusB = {
            id: chatId,
            other: newChat.memberA,
        };

        // add chat to profile B
        await Profile.findByIdAndUpdate(req.params.id,
            {$push: {chats: statusB}});

        res.status(200).json({chat_id: chatId});
        console.log('done ' + chatId);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.get('/:id', privateChat, async (req, res) => {
    try {
        const output = await Chat.findById(req.params.id);

        if (!output)
            res.status(404).json({ error: 'Not found' });

        // reset notificaions
        await Profile.findByIdAndUpdate(
            req.user._id,
            {$set: {'chats.$[elem].new': 0}},
            {arrayFilters: [{'elem.id': output._id}]});

        res.status(200).json(output);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.delete('/:id', privateChat, async (req, res) => {
   const chatId = req.params.id;
    try {
        const output = await Chat.findByIdAndDelete(chatId);
        if (!output)
            res.status(404).json({ error: 'Not found' });

        // delete chat from users pov
        // member A
        await Profile.findByIdAndUpdate(
            output.memberA.id,
            {$pull: {chats: { id: chatId}}});

        // member B
        await Profile.findByIdAndUpdate(
            output.memberB.id,
            {$pull: {chats: {id: chatId}}});

        res.status(200).json(output);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});



const messageURL = require('./message');

router.use('/message', messageURL);

module.exports = router;