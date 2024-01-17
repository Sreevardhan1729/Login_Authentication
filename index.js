import express from 'express';
import path from 'path'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();

mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",

}).then(()=>{console.log("connected")}).catch((e)=>{console.log(e)});
const userScheme = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});
const User = mongoose.model("User",userScheme);

// Using middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

//setting a view engine
app.set("view engine","ejs");

const isAuthenticated= async (req,res,next)=>{
    const {token} = req.cookies;
    if(token){
        const decode = jwt.verify(token,"dlkjhdfkjg");
        req.user =await User.findById(decode._id);
        next();
    }
    else{
        res.redirect("/login");
    }
};


app.get("/", isAuthenticated ,(req,res)=>{
    res.render("logout",{name:req.user.name});
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",async (req,res)=>{
    const {email,password} = req.body
    let user = await User.findOne({email});
    if(!user){
        return res.redirect("/register");
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(isMatch){
        const token =jwt.sign({ _id:user._id},"dlkjhdfkjg");
    res.cookie("token",token,{
        expires:new Date(Date.now()+60*1000)
    });
        return res.redirect("/");
    }
    else{
        return res.render("login",{email,message:"Incorrect Password"});
    }
});
app.post("/register",async (req,res)=>{
    const {name , email,password} =req.body

    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");
    }
    const hashedPass = await bcrypt.hash(password,10)
    user= await User.create({
        name,
        email,
        password :hashedPass,
    });
    const token =jwt.sign({ _id:user._id},"dlkjhdfkjg");
    res.cookie("token",token,{
        expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/");
});
app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        expires:new Date
    })
    res.redirect("/");
});

app.listen(5001, () => {
    console.log("It's running");
});
