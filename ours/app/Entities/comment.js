// Route to handle requests for /comment
const router = require('express').Router();
const {commentValidation} = require("../validation");
const {privateAccess} = require("../middleware");


router.post('/:id', commentValidation, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
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

        await Event.findByIdAndUpdate(req.params.id,
            {$push: {comments: newComment}});

        res.status(201).json({ message: 'Comment added', comment: savedComment });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.delete('/:id', privateAccess, async (req, res) => {
    try {
        const event = await Event.findById(req.body.eventid);
        if (!event)
            return res.status(400).json({ message: 'Bad Request' });

        const commentExists = event.comments.some(comment => comment._id.toString() === req.params.id);
        if (!commentExists)
            return res.status(400).json({ message: 'Bad Request' });

        await Event.findByIdAndUpdate(
            req.params.id,
            {$pull: {comments: {id: req.params.id}}});

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});



module.exports = router;