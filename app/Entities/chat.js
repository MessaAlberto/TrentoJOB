// Route to handle requests for /chat
const router = require('express').Router();
const {Chat} = require("../models/chatModel");
const {privateChat, blockGuest} = require("../middleware");
const {messageValidation} = require("../validation");
const {Profile} = require("../models/profileModel");

// create chat
router.post('/:id', blockGuest, async (req, res) => {
    try {
        const id = req.user._id;

        const memberB = await Profile.findById(req.params.id).select('username chats');

        // must exist and not be self
        if (!memberB || id === req.params.id)
            return res.status(400).json({ message: "Bad Request" });

        let alreadyExists = false;
        // mustn't have a chat already
        memberB.chats.forEach(chat => {
            if (chat.other.id === id)
                alreadyExists = true;
        });

        if (!alreadyExists) {
            // new chat
            let newChat = new Chat;
            newChat.memberA = { username: req.user.username, id: id, role: req.user.role };
            newChat.memberB = { username: memberB.username, id: req.params.id, role: req.user.role };
            const savedChat = await newChat.save();

            const chatId = savedChat._id.toString();

            // status update on the user side
            const statusA = {
                id: chatId,
                other: newChat.memberB,
                myTurn: false,
            }
            // add chat to profile A
            await Profile.findByIdAndUpdate(id,
                { $push: { chats: statusA } });

            const statusB = {
                id: chatId,
                other: newChat.memberA,
            };

            // add chat to profile B
            await Profile.findByIdAndUpdate(req.params.id,
                { $push: { chats: statusB } });

            res.status(200).json({ chat_id: chatId });
        } else {
            res.status(200).json({ message: "Chat already exists" });
        }
    } catch (err) {
        console.log('ciao');
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.patch('/:id', privateChat, messageValidation, async (req, res) => {
    try {
        // no message
        if (!req.body)
            return res.status(400).send("Bad Request");

        // must be logged in
        if (!req.user)
            return res.status(403).send("Not logged in");

        const chat = await Chat.findById(req.params.id);

        // must be part of the chat
        const id = req.user._id;

        if (!chat || (id !== chat.memberA.id && id !== chat.memberB.id))
            return res.status(400).json({ message: "Bad Request" });

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
            { $push: { messages: message } });

        // add notification
        const otherMemberId = id === chat.memberA.id ? chat.memberB.id : chat.memberA.id;

        await Profile.findByIdAndUpdate(
            otherMemberId,
            {
                $set: {
                    'chats.$[elem].lastMessage': req.body.text,
                    'chats.$[elem].lastDate': new Date(),
                    'chats.$[elem].myTurn': true,
                },
                $inc: { 'chats.$[elem].new': 1 }
            },
            {
                arrayFilters: [{ 'elem.id': chat._id }]
            });

        await Profile.findByIdAndUpdate(
            id,
            {
                $set: {
                    'chats.$[elem].lastMessage': req.body.text,
                    'chats.$[elem].lastDate': new Date(),
                    'chats.$[elem].myTurn': false,
                    'chats.$[elem].new': 0,
                }
            },
            {
                arrayFilters: [{ 'elem.id': chat._id }]
            });

        res.status(200).json({ message: 'message sent' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
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
            { $set: { 'chats.$[elem].new': 0 } },
            { arrayFilters: [{ 'elem.id': output._id }] });

        res.status(200).json(output);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
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
            { $pull: { chats: { id: chatId } } });

        // member B
        await Profile.findByIdAndUpdate(
            output.memberB.id,
            { $pull: { chats: { id: chatId } } });

        res.status(200).json(output);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



module.exports = router;