const express=require("express");
const router=express.Router();

const {isAuthenticatedUser,authorizeRoles}=require("../middleware/Auth");
const { newOrder,  getSingleOrder, myOrders, upadteorder, deleteOrder, allOrderAdmin } = require("../controllers/orderControllers");

router.post("/order/new",isAuthenticatedUser,newOrder)
router.get("/order/:id",isAuthenticatedUser,getSingleOrder);

router.get("/order/me",isAuthenticatedUser,myOrders)
router.get("/order/me",isAuthenticatedUser,myOrders)

router.get("/admin/orders",isAuthenticatedUser,authorizeRoles("admin"),allOrderAdmin)

router.put("/admin/order/:id",isAuthenticatedUser,authorizeRoles("admin"),upadteorder)
router.delete("/admin/order/:id",isAuthenticatedUser,authorizeRoles("admin"),deleteOrder)







module.exports=router