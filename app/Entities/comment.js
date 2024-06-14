// Route to handle requests for /comment
const router = require('express').Router();
const {commentValidation} = require("../validation");
const {privateComment, blockGuest} = require("../middleware");
const {Event} = require("../models/eventModel");
const {Comment} = require("../models/subModels");


router.post('/:id', blockGuest, commentValidation, async (req, res) => {
    const eventId = req.params.id;
    try {
        const event = await Event.findById(eventId);
        if (!event)
            return res.status(400).json({ message: 'Bad Request' });

        const newComment = new Comment({
            user: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
            },
            text: req.body.text,
        });

        event.comments.push(newComment);
        await event.save();

        res.status(201).json({message: 'Comment added'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.get('/:id', blockGuest, async (req, res) => {
    const eventId = req.params.id;
    try {
        const fields = 'owner comments';
        const event = await Event.findById(eventId).select(fields);
        if (!event)
            return res.status(400).json({ message: 'Bad Request' });

        res.status(200).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.delete('/:id', privateComment, async (req, res) => {
    const eventId = req.body.eventId;
    try {
        const event = await Event.findById(eventId);
        if (!event)
            return res.status(400).json({ message: 'Bad Request' });

        event.comments = event.comments.filter(comment => comment._id != req.params.id);

        await event.save();

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



module.exports = router;