const jwt = require('jwt');
const User = require('../models/user');
require('dotenv').config();

const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyUser);

        const user = await User.findOne({_id:verifyUser._id});
        console.log(user);

        next();
    }catch(e){
        res.status(401).send(e);
    }
}

module.exports = auth ;