const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");

async function createAccountController(req, res) {
    const user = req.user;

    const account = await accountModel.create({
        user: user._id,
    });

    return res.status(201).json({
        account,
    });
}

async function getUserAccountsController(req, res) {
    const accounts = await accountModel.find({ user: req.user._id });

    return res.status(200).json({
        accounts,
    });
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id,
    });

    if (!account) {
        return res.status(404).json({
            message: "Account Not Found",
        });
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance,
    });
}

/**
 * DELETE /api/accounts/:accountId
 * Close or delete an account if balance is 0
 */
async function closeAccountController(req, res) {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id,
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found or does not belong to your profile.",
            });
        }

        if (account.status === "CLOSED") {
            return res.status(400).json({
                message: "This account is already closed.",
            });
        }

        const balance = await account.getBalance();

        if (balance !== 0) {
            return res.status(400).json({
                message: `Cannot close account with active funds. Current balance is ₹${balance.toLocaleString(
                    "en-IN"
                )}. Please transfer or withdraw all funds first.`,
            });
        }

        // Check if historical ledger entries exist
        const hasLedger = await ledgerModel.exists({ account: account._id });

        if (!hasLedger) {
            // Unused account: safe to delete document
            await accountModel.deleteOne({ _id: account._id });
            return res.status(200).json({
                message: "Bank account deleted successfully.",
                deleted: true,
                accountId: account._id,
            });
        } else {
            // Historical account: set status to CLOSED to preserve audit trail
            account.status = "CLOSED";
            await account.save();
            return res.status(200).json({
                message: "Bank account closed successfully. Historical ledger records preserved.",
                deleted: false,
                account,
            });
        }
    } catch (error) {
        console.error("Close account error:", error);
        return res.status(500).json({
            message: "Failed to close account.",
            error: error.message,
        });
    }
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    closeAccountController,
};