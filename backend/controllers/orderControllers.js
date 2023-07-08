const Order = require("../models/orderModels");
const Product = require("../models/orderModels");
const User = require("../models/usermodesl");

//   creating an New order

// Creating a new order
exports.newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(), // Set the paidAt field with the current date
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Order Created Successfully",
      order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "invalid String or action",
    });
  }
};

// const get singl order

exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHander("Order not found with this Id", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Try Agian After Some Time",
    });
  }
};

// get logged in user  Orders
exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    next(error);
  }
};

// getallorderby admin

exports.allOrderAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find();

    let totalamount = 0;
    orders.forEach((order) => {
      totalamount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      orders,
      totalamount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    next(error);
  }
};
// update order by the admin

exports.upadteorder = async (req, res, next) => {
  try {
    // update order by the admin

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order is found",
      });
    }

    if (order.orderStatus === "Delivered") {
      return res.status(404).json({
        success: false,
        message: "You have aleready delived this order",
      });
    }
    order.orderItems.forEach(async (o) => {
      await updatestock(o.product, o.quantity);
    });
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      orders,
      totalamount,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    next(error);
  }
};

async function updatestock(id, quantity) {
  const product = await Product.findById(id);
  product.Stock = quantity;
  await product.save({ validateBeforeSave: false });
}

// delete orderby Admin

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order is found",
      });
    }

    await order.deleteOne();
    res.status(200).json({
      success: true,

      message: "Deleted Sucessfully have been Done",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    next(error);
  }
};
