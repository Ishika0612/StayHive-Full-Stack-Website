const User = require("../models/user")

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs")
}

module.exports.signup = async(req,res,next)=>{
    try{  
     let {username,email,password,role} = req.body
    const user = new User({
        username : username,
        email:email,
        role:role
    })
   const registeredUser = await User.register(user,password)
   req.login(registeredUser , (err)=>{
    if(err){
       return next(err)
    }
    req.flash("success","Welcome to StayHive!")
   res.redirect("/listings")
   })
}catch(err){
    req.flash("error",err.message)
    res.redirect("/signup")
}
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs")
}

module.exports.login = async(req,res)=>{
    req.flash("success" , "Welcome to StayHive, You are Logged in!!")
    let redirectUrl = res.locals.redirectUrl || "/listings"
     res.redirect(redirectUrl)
}

module.exports.logout = (req,res,next)=>{
    req.logout((err) =>{
    if(err){
      return next(err)
    }
    req.flash("success" , "You are Logged out now")
   res.redirect("/listings")
   })
}

module.exports.profilePage = (req,res,next)=>{
    if(req.user){
    res.render("users/profile.ejs")
    }
    else{
    res.status(404).render("listings/error.ejs", {status:404, message: "Profile Not Found" });
    }
}


module.exports.updateUsername = async (req, res, next) => {
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.redirect("/profile");
  }

  try {
    // Update username in DB and get the updated user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim() },
      { new: true } // return the updated document
    );

    // Refresh login session with updated user
    req.login(updatedUser, (err) => {
      if (err) return next(err);
      req.flash("success" , "Username Updated Successfully")
      return res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
