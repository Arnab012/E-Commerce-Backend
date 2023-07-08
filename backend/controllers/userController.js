const { profile } = require("console");
const User = require("../models/usermodesl");
const sendEmail = require("../utils/sendEmail");

const crypto = require("crypto");

// Register Use

exports.registeruser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "this is a sample id",
        url: "profile@url",
      },
    });
    const token = user.getJWTToken();
    res.cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.cookie_expires * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });
    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    // Mongoose Duplicate Error
    if (error.code === 11000) {
      const message = `Duplicate ${Object.keys(error.keyValue)} Entered`;
      return res.status(400).json({
        success: false,
        message,
      });
    }
    // JSON Web Token Error
    if (error.name === "JsonWebTokenError") {
      const message = `Invalid Json Web Token, Try Again With the Correct One`;
      res.status(400).json({
        success: false,
        message,
      });
    }
    // JSON Web Token Expire Error
    if (error.name === "TokenExpiredError") {
      const message = `Json Web Token Expired, Try Again`;
      res.status(400).json({
        success: false,
        message,
      });
    }
    // Other Errors
    res.status(400).json({
      success: false,
      message: "Please provide the input correctly",
    });
  }
};

// login Route
exports.loginuser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // checking if the user  has given email and password

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "please try to login with right crediantils " });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ error: "please try to login with right crediantils " });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res
        .status(401)
        .json({ error: "please try to login with right crediantils " });
    }
    const token = user.getJWTToken();
    res.cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.cookie_expires * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    if (err.name === "JsonWebTokenError") {
      const message = `Json web Token is invalid,Try Again With Right One`;
      res.status(400).json({
        success: false,
        message,
      });
    }

    //json web token expire Error

    if (err.name === "TokenExpiredError") {
      const message = `Json Web Token is Expired, Try again `;
      res.status(400).json({
        success: false,
        message,
      });
    }

    res.status(404).json({
      success: false,
      message: `Resource not found. Invalid: ${error}`,
    });
  }
};

exports.logoutuser = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out Sucessfully",
    });
  } catch (error) {
    if (err.name === "JsonWebTokenError") {
      const message = `Json web Token is invalid,Try Again With Right One`;
      res.status(400).json({
        success: false,
        message,
      });
    }

    //json web token expire Error

    if (err.name === "TokenExpiredError") {
      const message = `Json Web Token is Expired, Try again `;
      res.status(400).json({
        success: false,
        message,
      });
    }
    res.status(404).json({
      success: false,
      message: `Resource not found. Invalid: ${error}`,
    });
    next(error);
  }
};

// forgot password

exports.forgotpasswordbyuser = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // get reset password token

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordurl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `your password reset token is :-\n\n ${resetPasswordurl} \n\nIf You have not request for this please ignore this  you can contactc with us`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerece password Recovery for ${user.email}`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email send to ${user.email} Sucessfully`,
      });
    } catch (error) {
      user.getResetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    if (err.name === "JsonWebTokenError") {
      const message = `Json web Token is invalid,Try Again With Right One`;
      res.status(400).json({
        success: false,
        message,
      });
    }

    //json web token expire Error

    if (err.name === "TokenExpiredError") {
      const message = `Json Web Token is Expired, Try again `;
      res.status(400).json({
        success: false,
        message,
      });
    }
    res.status(401).json({
      success: false,
      message: "wrong Action",
    });
  }
};

exports.resetpassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Finding the user in the database
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset Password token is invalid or has expired",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match with Confirm Password",
      });
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();
    const token = user.getJWTToken();
    res.cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.cookie_expires * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });

    res.status(200).json({
      user,
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    if (err.name === "JsonWebTokenError") {
      const message = `Json web Token is invalid,Try Again With Right One`;
      res.status(400).json({
        success: false,
        message,
      });
    }

    //json web token expire Error

    if (err.name === "TokenExpiredError") {
      const message = `Json Web Token is Expired, Try again `;
      res.status(400).json({
        success: false,
        message,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get users details

exports.getonlyuserdetailswhoislogin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    if (err.name === "TokenExpiredError") {
      const message = `Json Web Token is Expired, Try again `;
      res.status(400).json({
        success: false,
        message,
      });
    }
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });

    res.status(400).json({
      success: false,
      message: `Intern Server Error|| Bad Request`,
    });
  }
};

exports.updatepassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Check password correctly",
      });
    }

    user.password = req.body.newPassword;
    await user.save();
    const token = user.getJWTToken();
    res.cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.cookie_expires * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });
    res.status(200).json({
      user,
      success: true,
      message: "Password Upadete is  successful",
    });
  } catch (error) {
    if (err.name === "JsonWebTokenError") {
      const message = `Json web Token is invalid,Try Again With Right One`;
      res.status(400).json({
        success: false,
        message,
      });
    }

    //json web token expire Error

    if (err.name === "TokenExpiredError") {
      const message = `Json Web Token is Expired, Try again `;
      res.status(400).json({
        success: false,
        message,
      });
    }
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }

    res.status(400).json({
      success: false,
    });
  }
};

// updating the profile using upadteprofile route

exports.updateprofile = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  // we will addd cloudnairy luseater

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Your information has been Updated Sucessfully",
    user
  });
};

exports.userdetailsall = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "The all user are--->:",
      users,
    });
  } catch (error) {
    next(error);
  }
};

// get details of the single user by admin

exports.getsinglemd = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: true,
        message: "User is Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "The user is--->:",
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }
    next(error);
  }
};

// route for the admini for updating the anyb user profile
exports.updateuserRole = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const newUserData = {
      name,
      email,
      role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found for the ID ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Your Task of upading  has done Sucessfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// delete any profile by the admin of the systeam

exports.deleteuserprofile = async (req, res, next) => {
  // we will remove cloudnairy luseater

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: true,
        message: `User is Not found for the ${req.params.id}`,
      });
    }
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Your Task of deleting  has done Sucessfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }

    res.status(400).json({
      success: false,
      message: "internal Server Error",
    });
  }
};
