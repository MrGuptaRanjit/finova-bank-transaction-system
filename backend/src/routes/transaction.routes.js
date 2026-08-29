const { Router } = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRoutes = Router();

/**
 * POST /api/transaction
 * Create a new transaction
 */
transactionRoutes.post(
    "/",
    authMiddleware.authMiddleware,
    transactionController.createTransaction
);

/**
 * POST /api/transaction/deposit
 * Deposit funds directly into self account
 */
transactionRoutes.post(
    "/deposit",
    authMiddleware.authMiddleware,
    transactionController.depositFunds
);

/**
 * POST /api/transaction/system/initial-funds
 * Create initial funds transaction from system user
 */
transactionRoutes.post(
    "/system/initial-funds",
    authMiddleware.authSystemUserMiddleware,
    transactionController.createInitialFundsTransaction
);

/**
 * GET /api/transaction
 * Get transactions of logged-in user
 */
transactionRoutes.get(
    "/",
    authMiddleware.authMiddleware,
    transactionController.getUserTransactions
);

module.exports = transactionRoutes;