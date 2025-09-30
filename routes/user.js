const express = require("express")
const router = express.Router()
const passport = require("passport")
const wrapAsync = require("../utils/wrapasync")
const User = require("../models/user")
const {savedRedirectUrl} = require("../middleware")
const userController = require("../controllers/users")


router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup))

router.route("/login")
.get(userController.renderLoginForm)
.post( passport.authenticate('local', { failureRedirect: '/login', failureFlash : true }), savedRedirectUrl, userController.login)

router.get("/logout" , userController.logout)

router.get("/profile", userController.profilePage)

router.post("/profile/update-username", userController.updateUsername)

module.exports= router