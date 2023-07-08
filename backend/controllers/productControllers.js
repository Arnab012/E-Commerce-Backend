const { query } = require("express");
const Product = require("../models/productmodels");
const ApiFeatures = require("../utils/apiFeatures");

//createProducts--Admin Routes

exports.createProducts = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

//get all the Product details
exports.getallproducts = async (req, res) => {
  try {
    const productcount = await Product.countDocuments();
    const resultperpage = 5;
    const apifeatures = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultperpage);
    const productss = await apifeatures.query;
    res.status(200).json({ success: true, productss, productcount });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Plese  Check it correctly",
    });
    next(error);
  }
};

// get product details

exports.getproductsingledetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(500).json({
        success: false,
        message: "product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
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
//udate Route for the Product---only Admin

exports.updatetheProducts = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(500).json({
        success: false,
        message: "product Not found",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      product,
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

// delete Route--Admin

exports.deleteProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(500).json({
        success: true,
        message: "product Not Found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "products Deleted Sucessfully",
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

// create the review or updaing the review

exports.createProductReview = async (req, res, next) => {
  try {
    // ...
const { rating, comment, productId } = req.body;

const review = {
  user: req.user._id,
  name: req.user.name,
  rating: Number(rating),
  comment: comment, // Assign the comment value to the review object
};

// ...


    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      review,
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

// to get all the review
exports.getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "all the reveiw are-->",
        product,
      });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }
    res.status(404).json({
      success: false,
      message: "inter server error",
    });
  }
};

// Delete Review
exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.productId);

    if (!product) {
      res.status(404).json({
        success:false,
        message:"product Not found"
      })
    }

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
      avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      message:"Done sucessfully"
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({
        success: false,
        message: `Resource not found. Invalid: ${error.path}`,
      });
    }
    // Handle the error
    next(error);
  }
};
