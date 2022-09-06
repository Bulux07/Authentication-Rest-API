//import package
const jwt = require('jsonwebtoken');

//checking for request if we have this token
//middleware function- checks if the user has the token
module.exports = function (req,res,next){
    //get token
    const token = req.header('auth-token');
    //does not exist
    if(!token) return res.status(401).send('Acess denied');

    try{
        //try to verify it
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    }catch(err){
        //incorrect
        res.status(400).send('Invalid Token');
    }
}