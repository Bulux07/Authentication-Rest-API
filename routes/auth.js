//import package
const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {registerValidation, logInValidate} = require('../validation');



router.post('/register', async (req,res) => {

    //validate user first
    const{error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //if user already in the database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exist');

    //hash password, complexity of string thats generated
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);


    //create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });
    try{
        const savedUser = await user.save();
        res.send({user:user.id});
    }catch(err){
        res.status(400).send(err);
    }
});

//log in 
router.post('/login', async (req,res) =>{
        //validate user first
        const{error} = logInValidate(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        //if user already in the database or if doesnt exist
        const user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).send('Email or password is wrong');

        //if password is correct
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if(!validPass) return res.status(400).send("invalid password")

        //create and assigned a token
        const token = jwt.sign({__id: user._id}, process.env.TOKEN_SECRET);
        res.header('auth-token', token).send(token);


        //res.send('Logged in');
});

module.exports = router;