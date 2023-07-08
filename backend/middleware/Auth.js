const User = require("../models/usermodesl");
const jwt = require("jsonwebtoken");
exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      res.status(400).json({
        success: false,
        messge: `Error:Please Login to use this resources`,
      });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SCERETE);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    next(error);
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
    
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: ` ${req.user.role} is not allowed to access this resource.`,
        });
      }

      next();
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "There is an Error with this Function",
      });
      next(error);
    }
  };
};
