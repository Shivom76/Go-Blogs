if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }

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
const flash=require("connect-flash")

const {saveRedirectUrl}=require("./middleware.js")


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
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req,res,next)=>{
    res.locals.currUser=req.user;
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    next();
})


app.set("view engine","ejs")
app.engine("ejs",ejsMate)

app.set("views",[
    path.join(__dirname,"/views/blogsList"),
    path.join(__dirname,"/views/layouts"),
    path.join(__dirname,"/views/users")
])

app.use(express.static(path.join(__dirname,"/public")))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.set(methodOverride("_method"))


// const MONGO_URL="mongodb://127.0.0.1:27017/Blogs"
const MONGO_URL=process.env.ATLAS_URL

async function main(){
    try{
        await mongoose.connect(MONGO_URL)
        console.log("mongoDB-ATLAS is connected")
    }catch(err){
        console.log(err)
    }

}
main()

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
    if(req.user){
        let username=req.user.username
        res.render("new.ejs",{username})
    }else{
        req.flash("error","You must be Signed In")
        res.redirect("/login")
    }
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





//User routes

app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.post("/login",saveRedirectUrl,
    passport.authenticate("local",{failureRedirect:"/login"}),
    (req,res)=>{
        req.flash("success","Welcome User")
        res.redirect("/blogs")
})

app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})

app.post("/signup",async (req,res)=>{
    let {email,username,password}=req.body;
    let newUser=new User({email,username})

    let registeredUser=await User.register(newUser,password);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err)
        }
        req.flash("success", "Welcome! You are now logged in.");
            res.redirect("/blogs");
    })

    console.log(registeredUser)
})

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err)
        }
        res.redirect("/blogs")
    })
})