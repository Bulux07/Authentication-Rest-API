//import package
const router = require('express').Router();

const User = require('../model/User');
const  verify = require('./verifiedToken');

router.get('/',verify, (req,res) =>{
    res.send(req.user);
    User.findOne({_id: req.user});
});

module.exports = router;