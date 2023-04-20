require('dotenv').config();
const express = require('express');
const path = require('path');
require('./db/conn');
const hbs = require('hbs');
const User = require('../src/models/user');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const auth = require('../src/middleware/auth');
const port  = process.env.PORT || 3000;

const static_path = path.join(__dirname,'../public')
const templates_path = path.join(__dirname,'../templates/views')
const partials_path = path.join(__dirname,'../templates/partials')

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser);

app.use(express.static(static_path));
app.set('view engine','hbs');
app.set('views',templates_path)
hbs.registerPartials(partials_path)


app.get('/secret', auth ,(req,res) =>{
    //console.log(req.cookies.jwt);
    res.render('secret');
})

//login user
app.get('/login',(req,res) =>{
    res.render('login');
})

app.post('/login', async (req,res) =>{
    try{
        const email = req.body.email;
        const pass = req.body.password;

        //here email from batabase and user input is matched and data are stored in useremail
        const useremail = await User.findOne({email});

        const isMatch = await bcrypt.compare(pass, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log(token);

        res.cookie("jwt",token,{
            expiresIn:'1h',
            httpOnly:true
            //secure:true
        });

        

        if(isMatch){
            res.render('index');
            //res.send('you are logged in');
            //res.status(201).render("index");
        }else{
            res.send("invalid  or password");
        }
    }catch(e){
        res.status(400).send('invalid');
    }
})

//create user in db
app.get('/register',(req,res) =>{
    res.render('register');
})

app.post('/register', async (req,res) =>{
    try{
        const pass  = req.body.password;
        const cpass = req.body.confirmpassword;
        if(pass === cpass){

            const registerUser = new User(req.body);
            //hash password

            const token = await registerUser.generateAuthToken();
            console.log(token)

            res.cookie("jwt",token,{
                expiresIn:'1h',
                httpOnly:true
                //secure:true
            });
            console.log(cookie);

            const regsiter = await registerUser.save();
            res.send(regsiter);

        }else{
            res.send('please enter same password.')
        }
    }catch(e){
        res.status(400).send(e)
    }
})

app.listen(port,()=>{
    console.log(`Listening at ${port}`);
})