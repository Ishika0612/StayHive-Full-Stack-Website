const Review = require("../models/reviews")
const Listing = require("../models/listing")

module.exports.createReview = async(req,res)=>{
    let {id} = req.params
  let listing = await Listing.findById(id)
   
  let review1 = new Review(req.body.review)
   review1.author = req.user._id
   listing.reviews.push(review1)
   await review1.save();
   await listing.save();
   req.flash("success" , "New Review Created!")
   res.redirect(`/listings/${id}`)
}

module.exports.deleteReview = async(req,res)=>{
    let{id,reviewId} = req.params
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success" , "Review Deleted!")
    res.redirect(`/listings/${id}`)
}