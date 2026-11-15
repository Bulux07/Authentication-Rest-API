const router = require('express').Router();
const User = require('../model/User');
const verify = require('./verifiedToken'); // Match your actual filename (verifyToken or verifiedToken)

router.get('/', verify, async (req, res) => {
    try {
        // Find the user in MongoDB using the _id stored inside the JWT token payload
        const user = await User.findById(req.user._id);
        
        // Send back the user data (or whatever protected data you want)
        res.json({
            posts: {
                title: 'My Protected Data',
                description: 'Only accessible with a valid token.'
            },
            loggedUser: user
        });
    } catch (err) {
        res.status(400).send({ message: 'Error fetching user data' });
    }
});

module.exports = router;