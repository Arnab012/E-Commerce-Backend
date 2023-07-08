const express = require("express");
const {
  registeruser,
  loginuser,
  logoutuser,
  forgotpasswordbyuser,
  resetpassword,
  getonlyuserdetailswhoislogin,
  updatepassword,
  updateprofile,
  userdetailsall,
  getsinglemd,
  updateuserRole,
  deleteuserprofile,
} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/Auth");

const router = express.Router();

router.post("/register", registeruser);
router.post("/login", loginuser);
router.post("/password/forgot", forgotpasswordbyuser);
router.put("/password/reset/:token", resetpassword);
router.get("/logout", logoutuser);

router.get("/me", isAuthenticatedUser, getonlyuserdetailswhoislogin);
router.put("/password/update", isAuthenticatedUser, updatepassword);
router.put("/me/update",isAuthenticatedUser,updateprofile);
router.get("/admin/users",isAuthenticatedUser,authorizeRoles("admin"),userdetailsall);
router.get("/admin/user/:id",isAuthenticatedUser,authorizeRoles("admin"),getsinglemd)
router.put("/admin/user/:id",isAuthenticatedUser,authorizeRoles("admin"),updateuserRole)
router.delete("/admin/user/:id",isAuthenticatedUser,authorizeRoles("admin"),deleteuserprofile)





module.exports = router;
