module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.RedirectUrl){
        res.locals.RedirectUrl=req.session.RedirectUrl
    }

    next()
}

