if(process.env.NODE_ENV!="production"){
    require('dotenv').config()
}

const express = require("express")
const app= express();
const mongoose = require("mongoose")
const Listing = require("./models/listing")
const Review = require("./models/reviews")
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError")
const wrapAsync = require("./utils/wrapasync")
const {listingSchema,reviewSchema}  = require("./schema")
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const localStrategy = require("passport-local")
const User = require("./models/user")


const listingRouter = require('./routes/listing')
const reviewRouter = require("./routes/reviews")
const userRouter = require("./routes/user")


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const dbUrl = process.env.ATLASDB_URL

const store = MongoStore.create({
     mongoUrl:dbUrl,
      crypto: {
    secret: process.env.SECRET
  },
  touchAfter : 24*3600
})

store.on("error" , ()=>{
    console.log("Error in Mongo Store", err)
})

let sessionOptions = {
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie :{
        expires : Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
}


app.use(session(sessionOptions))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


main().then(()=>{console.log("mongodb connected successfully")}).catch((err)=>{console.log(err)})

async function main(){
    await mongoose.connect(dbUrl)
}

app.listen(8080, ()=>{
    console.log(`app is listening on port 8080 `)
})

app.use((req,res,next)=>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next();
})

app.get("/privacy",(req,res)=>{
    res.render("layouts/privacy.ejs")
})

app.get("/terms",(req,res)=>{
    res.render("layouts/terms.ejs")
})
//for user
app.use("/" , userRouter)

//for listing
app.use("/listings" , listingRouter)

//for reviews
app.use("/listings/:id/reviews", reviewRouter)
 

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err,req,res,next)=>{
    let {status = 500 , message = "Some Error Occured"} = err;
    res.status(status).render("listings/error.ejs",{status,message})
})