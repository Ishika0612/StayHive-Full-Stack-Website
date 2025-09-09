const express = require("express")
const router = express.Router({mergeParams : true})
const ExpressError = require("../utils/ExpressError")
const wrapAsync = require("../utils/wrapasync")
const {reviewSchema}  = require("../schema")
const Review = require("../models/reviews")
const Listing = require("../models/listing")
const {isLoggedIn,isReviewAuthor} = require("../middleware")
const reviewController = require("../controllers/review")


const validateReviewSchema = (req,res,next) =>{
     let { error } = reviewSchema.validate(req.body);
    if (error) {
        let msg = error.details.map(el => el.message).join(", ");
        return next(new ExpressError(400, msg)); 
    } else {
        next();
    }
}

//reviews post route
router.post("/", isLoggedIn, validateReviewSchema , wrapAsync(reviewController.createReview))


//delete any review from a post
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview))

module.exports= router