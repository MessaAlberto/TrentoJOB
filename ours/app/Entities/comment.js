// Route to handle requests for /comment
const router = require('express').Router();
const {commentValidation} = require("../validation");
const {privateAccess, blockGuest} = require("../middleware");
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
        const event = await Event.findById(eventId);
        if (!event)
            return res.status(400).json({ message: 'Bad Request' });

        res.status(200).json(event.comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.delete('/:id', privateAccess, async (req, res) => {
    const commentId = req.params.id;
    const eventId = req.body.id;
    try {
        const event = await Event.findById(eventId);
        if (!event)
            return res.status(400).json({ message: 'Bad Request' });

        const commentExists = event.comments.some(comment => comment._id.toString() === commentId);
        if (!commentExists)
            return res.status(400).json({ message: 'Bad Request' });

        await Event.findByIdAndUpdate(
            eventId,
            {$pull: {comments: {id: commentId}}});

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});



module.exports = router;