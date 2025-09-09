const express = require("express")
const router = express.Router()
const Listing = require("../models/listing")
const ExpressError = require("../utils/ExpressError")
const wrapAsync = require("../utils/wrapasync")
const {listingSchema}  = require("../schema")
const {isLoggedIn,isOwner} = require("../middleware")
const listingController = require("../controllers/listings")

const multer  = require('multer')
const {storage} = require("../cloudConfig")
const upload = multer({ storage })


const validateListingSchema = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let msg = error.details.map(el => el.message).join(", ");
        return next(new ExpressError(400, msg)); 
    } else {
        next();
    }
};


router.route("/")
//show all listings
.get(wrapAsync(listingController.index))
//create and add new listing
.post(isLoggedIn,  validateListingSchema, upload.single("image"), wrapAsync(listingController.createListing))

//form to add new listing
router.get("/new" ,isLoggedIn, listingController.renderNewForm)

router.route("/:id" )
//show particular listing
.get(wrapAsync(listingController.showListing))
//edit/update listing
.put(isLoggedIn, isOwner, upload.single("image"), validateListingSchema , wrapAsync(listingController.updateListing))
//delete any listing
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing))

//form to edit any listing
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm))


module.exports = router
