const userModel = require("../models/user.model");
const accountModel = require("../models/account.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");

// User register controller
async function userRegisterController(req, res) {
    const { email, password, name } = req.body;

    const isExists = await userModel.findOne({
        email: email,
    });

    if (isExists) {
        return res.status(422).json({
            message: "User already exists with this email",
            status: "failed",
        });
    }

    const user = await userModel.create({
        email,
        password,
        name,
    });

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token);

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
        },
        token,
    });

    emailService.sendRegistrationEmail(
        user.email,
        user.name
    ).catch(err => {
        console.warn("Registration email failed:", err.message);
    });
}

// User login controller
async function userLoginController(req, res) {
    const { email, password } = req.body;

    const user = await userModel
        .findOne({ email })
        .select("+password");

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password.",
        });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        return res.status(401).json({
            message: "Invalid email or password.",
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token);

    return res.status(200).json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        token,
    });
}

// User logout controller
async function userLogoutController(req, res) {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully!",
        });
    }

    await tokenBlackListModel.create({
        token,
    });

    res.clearCookie("token");

    return res.status(200).json({
        message: "User logged out successfully!",
    });
}

// Get currently authenticated user
async function getCurrentUserController(req, res) {
    // authMiddleware has already verified the token
    // and attached the user to req.user

    if (!req.user) {
        return res.status(401).json({
            message: "Not authenticated",
        });
    }

    return res.status(200).json({
        user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
        },
    });
}

// Delete user profile and deactivate associated accounts
async function deleteUserProfileController(req, res) {
    try {
        const userId = req.user._id;

        // Find all accounts belonging to the user
        const userAccounts = await accountModel.find({ user: userId });

        // Calculate total remaining balance
        let totalBalance = 0;
        for (const account of userAccounts) {
            const bal = await account.getBalance();
            totalBalance += bal;
        }

        if (totalBalance > 0) {
            return res.status(400).json({
                message: `Cannot delete profile with remaining funds. You have an active balance of ₹${totalBalance.toLocaleString(
                    "en-IN"
                )} across your accounts. Please transfer or withdraw all funds before deleting your profile.`,
            });
        }

        // Close all user bank accounts
        await accountModel.updateMany({ user: userId }, { status: "CLOSED" });

        // Invalidate JWT session token
        const token =
            req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (token) {
            await tokenBlackListModel.create({ token });
        }

        // Delete user document
        await userModel.findByIdAndDelete(userId);

        res.clearCookie("token");

        return res.status(200).json({
            message: "User profile and all associated data deleted successfully.",
        });
    } catch (error) {
        console.error("Delete user profile error:", error);
        return res.status(500).json({
            message: "Failed to delete user profile.",
            error: error.message,
        });
    }
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController,
    getCurrentUserController,
    deleteUserProfileController,
};