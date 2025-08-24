const express=require("express")
const app=express()
const path=require("path")
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate");
const mongoose=require("mongoose")
const Blog=require("./models/Blog")
const session=require("express-session")
// import mongo-store afterwards--------------for online storage
const passport=require("passport")
const LocalStrategy=require("passport-local")
const User=require("./models/User")


// process.env.SECRET
sessionOptions={
    secret:"MySecretCode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:60*60*24*7
    }
}

app.use(session(sessionOptions))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.set("view engine","ejs")
app.engine("ejs",ejsMate)
// app.set("views",path.join(__dirname,"/views/blogsList"));

app.set("views",[
    path.join(__dirname,"/views/blogsList"),
    path.join(__dirname,"/views/layouts"),
    path.join(__dirname,"/views/users")
])

app.use(express.static(path.join(__dirname,"/public")))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.set(methodOverride("_method"))


const MONGO_URL="mongodb://127.0.0.1:27017/Blogs"

async function main(){
    mongoose.connect(MONGO_URL)
}

main().then(()=>{
    console.log("mongoDB is connected")
}).catch((err)=>{
    console.log(err)
})

app.listen(8080,()=>{
    console.log("8080 port is listening")
})

app.get("/",(req,res)=>{
    res.send("hello guyss")
})

app.get("/blogs",async (req,res)=>{
    let Listing=await Blog.find({})
    res.render("blogs.ejs",{Listing:Listing})
})

app.get("/blogs/new",(req,res)=>{
    res.render("new.ejs")
})

app.post("/blogs/new",async(req,res)=>{
    if(req.body.blog.username.length>0){
        let newBlog=new Blog(req.body.blog)
        await newBlog.save()
        console.log(req.body.blog)
    }
    res.redirect("/blogs")
})

app.get("/blogs/edit/:id",(req,res)=>{
    let {id}=req.params;
    res.render("edit.ejs",{id})
})

app.post("/blogs/edit/:id",async (req,res)=>{
    let {id}=req.params;
    let newBlog=await Blog.findByIdAndUpdate(id,{...req.body.blog});
    await newBlog.save();
    console.log(newBlog);
    res.redirect("/blogs")
})


app.post("/blogs/delete/:id",async(req,res)=>{
    let {id}=req.params;
    let deleteBlog=await Blog.findByIdAndDelete(id)
    console.log(deleteBlog)
    res.redirect("/blogs")
})

app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})

app.post("/signup",async (req,res)=>{
    let {email,username,password}=req.body;
    let newUser=new User({email,username})

    let registeredUser=await User.register(newUser,password);
    console.log(registeredUser)
    res.redirect("/blogs")
})