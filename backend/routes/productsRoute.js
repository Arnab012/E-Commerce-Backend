const express = require("express");
const {
  getallproducts,
  createProducts,
  updatetheProducts,
  deleteProducts,
  getproductsingledetails,
  createProductReview,
  getallreview,
  deletereview,
  getProductReviews,
  deleteReview,
} = require("../controllers/productControllers");

// All middleware for the Authentication and Authorize Role

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/Auth");
const router = express.Router();

router.get("/products", getallproducts);

router.post(
  "/admin/products/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProducts
);

router.put(
  "/admin/products/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updatetheProducts
);
router.delete(
  "/admin/products/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProducts
);

router.get("/products/:id", getproductsingledetails);
router.put("/reveiw", isAuthenticatedUser,createProductReview);
router.get("/reveiws", getProductReviews);
router.delete("/reveiws", isAuthenticatedUser,deleteReview);


module.exports = router;


