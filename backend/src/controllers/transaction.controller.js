const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - Create a new Transaction
 * The 10 Step transfer flow:
 * 1. Validate Request
 * 2. Validate idempotency Key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger Entry
 * 7. create CREDIT ledger entry
 * 8. Mark Transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req,res) {
    const{fromAccount,toAccount,amount,idempotencyKey} = req.body;

    /**
     *  1. Validate Request
     */ 
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "fromAccount, toAccount, amount, and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,
        user: req.user._id
    })

    const toUserAccount = await accountModel.findOne({
        _id:toAccount
    }).populate("user")

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }


    /**
     *  2. Validate idempotency Key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })


    if(isTransactionAlreadyExists){

        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                isTransactionAlreadyExists: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing"
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }


    /**
     *  3. Check account status
     */
    if(fromUserAccount.status !=="ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be Active"
        })
    }

    /**
    * 4. Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getBalance()

    if(balance<amount){
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    /**
     * Create transaction (PENDING)
     */

    let transaction;
    try {
    const session = await mongoose.startSession()
    session.startTransaction()

     transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }],{session}))[0]

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type:"DEBIT",
    }],{session})

    await (()=>{
        return new Promise((ressolve)=>{
            setTimeout(ressolve,3*1000)
        })
    })()

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
    }],{session})

    await transactionModel.findOneAndUpdate(
        {_id: transaction._id},
        {status: "COMPLETED"},
        {session} 
    )

    await session.commitTransaction()
    session.endSession()
    } catch (error) {
        return res.status(400).json({
            message: "Transaction is pending due to some issue, please retry after some time"
        })
    }

    /**
     * 10. Send email notifications (non-blocking)
     */
    if (req.user?.email) {
        emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount).catch(err => {
            console.warn("Sender transfer email error:", err.message);
        });
    }

    if (toUserAccount?.user?.email) {
        emailService.sendPaymentReceivedEmail(toUserAccount.user.email, toUserAccount.user.name, amount, req.user.name, toAccount).catch(err => {
            console.warn("Recipient credit email error:", err.message);
        });
    }

    return res.status(201).json({
        message: "Transaction Completed Successfully!",
        transaction: transaction
    })
}

async function createInitialFundsTransaction(req,res) {
    const {toAccount,amount,idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "toAccount,amount and idempotency are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid Account"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if(!fromUserAccount){
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount:amount,
        transaction: transaction._id,
        type:"DEBIT",
    }],{session})

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount:amount,
        transaction: transaction._id,
        type:"CREDIT"
    }],{session})

    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully!",
        transaction: transaction
    })

}

async function getUserTransactions(req, res) {
    try {
        // Find all accounts belonging to logged-in user
        const userAccounts = await accountModel.find({
            user: req.user._id,
        }).select("_id");

        const accountIds = userAccounts.map(
            (account) => account._id.toString()
        );

        // Find transactions involving user's accounts
        const transactions = await transactionModel
            .find({
                $or: [
                    {
                        fromAccount: {
                            $in: accountIds,
                        },
                    },
                    {
                        toAccount: {
                            $in: accountIds,
                        },
                    },
                ],
            })
            .sort({ createdAt: -1 });

        // Add transaction direction
        const formattedTransactions = transactions.map(
            (transaction) => {
                const fromAccountId =
                    transaction.fromAccount.toString();

                const toAccountId =
                    transaction.toAccount.toString();

                let direction;

                if (accountIds.includes(fromAccountId)) {
                    direction = "SENT";
                } else if (accountIds.includes(toAccountId)) {
                    direction = "RECEIVED";
                }

                return {
                    ...transaction.toObject(),
                    direction,
                };
            }
        );

        return res.status(200).json({
            message: "Transactions fetched successfully",
            transactions: formattedTransactions,
        });

    } catch (error) {
        console.error(
            "Get transactions error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch transactions",
        });
    }
}

/**
 * POST /api/transaction/deposit
 * Deposit funds to self account
 */
async function depositFunds(req, res) {
    try {
        const { toAccount, amount, paymentMethod, idempotencyKey } = req.body;

        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount, and idempotencyKey are required.",
            });
        }

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                message: "Deposit amount must be a positive number greater than 0.",
            });
        }

        // Verify account belongs to logged-in user
        const targetAccount = await accountModel.findOne({
            _id: toAccount,
            user: req.user._id,
        });

        if (!targetAccount) {
            return res.status(404).json({
                message: "Target account not found or does not belong to your profile.",
            });
        }

        if (targetAccount.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Cannot deposit funds into a non-active account.",
            });
        }

        // Idempotency check
        const existingTx = await transactionModel.findOne({ idempotencyKey });
        if (existingTx) {
            return res.status(200).json({
                message: "Deposit transaction already processed.",
                transaction: existingTx,
            });
        }

        // Find or provision dedicated Internal System Treasury User & Account
        let systemUser = await userModel.findOne({ email: "treasury@finova.internal" }).select("+systemUser");
        if (!systemUser) {
            systemUser = await userModel.create({
                name: "Finova Central Treasury Reserve",
                email: "treasury@finova.internal",
                password: "FinovaTreasuryVaultSecretKey2026!",
                systemUser: true,
            });
        }

        let systemAccount = await accountModel.findOne({ user: systemUser._id });
        if (!systemAccount) {
            systemAccount = await accountModel.create({
                user: systemUser._id,
                status: "ACTIVE",
                currency: "INR",
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        let transaction;
        try {
            transaction = (await transactionModel.create([{
                fromAccount: systemAccount._id,
                toAccount: targetAccount._id,
                amount: numericAmount,
                idempotencyKey,
                status: "COMPLETED",
            }], { session }))[0];

            // Double-entry ledger: DEBIT system treasury, CREDIT user account
            await ledgerModel.create([{
                account: systemAccount._id,
                amount: numericAmount,
                transaction: transaction._id,
                type: "DEBIT",
            }], { session });

            await ledgerModel.create([{
                account: targetAccount._id,
                amount: numericAmount,
                transaction: transaction._id,
                type: "CREDIT",
            }], { session });

            await session.commitTransaction();
            session.endSession();
        } catch (dbErr) {
            await session.abortTransaction();
            session.endSession();
            console.error("Deposit session error:", dbErr);
            return res.status(500).json({
                message: "Deposit failed during ledger transaction. Please try again.",
            });
        }

        // Fetch updated account balance
        const newBalance = await targetAccount.getBalance();

        // Email notification
        try {
            if (req.user?.email) {
                emailService.sendDepositEmail(
                    req.user.email,
                    req.user.name,
                    numericAmount,
                    targetAccount._id
                ).catch(mailErr => {
                    console.warn("Deposit email notification failed:", mailErr.message);
                });
            }
        } catch (mailErr) {
            console.warn("Deposit email notification failed:", mailErr.message);
        }

        return res.status(201).json({
            message: "Deposit completed successfully! Funds added to your account.",
            transaction,
            newBalance,
        });
    } catch (error) {
        console.error("Deposit error:", error);
        return res.status(500).json({
            message: "Failed to process deposit.",
            error: error.message,
        });
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getUserTransactions,
    depositFunds,
};