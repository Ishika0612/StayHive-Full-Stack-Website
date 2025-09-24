const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const map_token = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: map_token });

module.exports.index = async(req,res)=>{
  let {dest ,sort} = req.query
    let lists = await Listing.find(dest ? { location: { $regex: dest, $options: "i" } } : {}).sort(sort === "price_asc" ? { price: 1 } : sort === "price_desc" ? { price: -1 } : {});
    res.render("listings/listings.ejs", { lists });
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
}

module.exports.showListing = async(req,res)=>{
   let {id}= req.params
   let list = await Listing.findById(id).populate({path:"reviews" , populate : {path : "author"}}).populate("owner")
   if(!list){
     req.flash("error" , "Listing you requested for does not exist!")
     return res.redirect("/listings")
   }
   res.render("listings/show.ejs", {list , mapToken: process.env.MAP_TOKEN })
}

module.exports.createListing = async(req,res)=>{ 
    let response = await geocodingClient.forwardGeocode({
  query: req.body.location,
  limit: 1
})
  .send()

    let url = req.file.path
    let filename = req.file.filename
    let newList= new Listing(req.body)
    newList.geometry = response.body.features[0].geometry
    newList.image = {url , filename}
    newList.owner = req.user._id
  await newList.save()
  req.flash("success" , "New Listing Created!")
  res.redirect("/listings")
}

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params
    const currList = await Listing.findById(id)
    if(!currList){
     req.flash("error" , "Listing you requested for does not exist!")
    return  res.redirect("/listings")
   }
   let originalImage = currList.image.url
   originalImage = originalImage.replace("/upload", "/upload/h_200,w_250")
    res.render("listings/edit.ejs" , {currList,originalImage})
}

module.exports.updateListing = async(req,res)=>{
    let {id}= req.params
   let listing = await Listing.findByIdAndUpdate(id , req.body , { runValidators: true })
   if(typeof req.file !== "undefined"){
     let url = req.file.path
    let filename = req.file.filename
   listing.image = {url,filename}
   await listing.save()
   }
    req.flash("success" , "Listing Edited Successfully!")
    res.redirect(`/listings/${id}`)
}

module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params
    await Listing.findByIdAndDelete(id)
    req.flash("success" , "Listing Deleted Successfully!")
    res.redirect("/listings")
}