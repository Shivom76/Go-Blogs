const mongoose=require("mongoose")
const Schema=mongoose.Schema

const BlogsSchema=new Schema({
    username:{
        type:String,
        require
    },
    content:{
        type:String,
        require
    },
    // time:Date.now()
})


const Blog=mongoose.model("Blog",BlogsSchema);

module.exports=Blog;