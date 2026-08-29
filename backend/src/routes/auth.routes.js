const express = require("express")

const router = express.Router()

const authController = require("../controllers/auth.controllers")
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/register",authController.userRegisterController)
router.post("/login",authController.userLoginController)
router.post("/logout",authController.userLogoutController)
router.get(
    "/me",
    authMiddleware,
    authController.getCurrentUserController
);
router.delete(
    "/profile",
    authMiddleware,
    authController.deleteUserProfileController
);
module.exports = router;