const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()
/** 
*-POST /api/accounts/
*- create a new account
*- Protected Route
*/
router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

/**
 * -GET /api/accounts/
 * Get all accounts of the logged in user
 * Protected Routes
 */
router.get("/",authMiddleware.authMiddleware, accountController.getUserAccountsController)

/**
 * GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController);

/**
 * DELETE /api/accounts/:accountId
 * Close / Delete account (requires 0 balance)
 */
router.delete("/:accountId", authMiddleware.authMiddleware, accountController.closeAccountController);

module.exports = router;