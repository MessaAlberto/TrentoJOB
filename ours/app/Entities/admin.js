const router = require('express').Router();
const {privateAccess} = require("../middleware");

// create
router.post('/', async (req,res) => {
    // TODO
});

// modify
router.put('/:id', privateAccess, async (req,res) => {
    // TODO
});

router.get('/:id', privateAccess,  async (req, res) => {
    // TODO

});

router.delete('/:id', privateAccess, async (req,res) => {
    // TODO
});



module.exports = router;