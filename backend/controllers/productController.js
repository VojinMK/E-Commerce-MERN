const { json } = require("express");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const cloudionary =require ("cloudinary");

//kreiranje novog proizvoda => /api1/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
 
  let images=[]
  if(typeof req.body.images==='string'){
    images.push(req.body.images)
  }else{
    images=req.body.images
  }

  let imagesLinks=[]

  for(let i=0;i<images.length;i++){
    const result=await cloudionary.v2.uploader.upload(images[i],{
      folder:'products'
    })

    imagesLinks.push({
      public_id:result.public_id,
      url:result.secure_url
    })
  }

  req.body.images=imagesLinks;
  req.body.user = req.user.id; //id da bi videli ko je kreirao proizvod

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// Get za sve produkte => /api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 4; //prroj proizvoda po strani, kad se salje get all, da ne salje sve odmah
  const productsCount = await Product.countDocuments(); //koristcemo za dorntend

  //nakon uvoza apiFeatures klase i preko konstruktora prosledjujemo potrebne podatke, i vrsi se pretraga na osnovu
  //stvari koje su prosledjene uz api i search koji preterzuje na osnovu imena i filter koji je filter na osnovu neke stvari
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeatures.query;
  let filteredProductsCount = products.length;

  apiFeatures.pagination(resPerPage);
  products = await apiFeatures.query.clone();

  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products
  });
});


// Get za sve produkte admin  => /api/v1/admin/products
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {

  const  products = await Product.find();


  res.status(200).json({
    success:true,
    products
  });
});

//Get detalje pojedinacnog proizoda na osnovu id-a=>/api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// update produkta /api/v1/admin/product/:id

exports.UpdateProduct = catchAsyncErrors(async (req, res, next) => {
  //let iz razloga sto menjamo
  let product = await Product.findById(req.params.id);

  if (!product) {
      return next(new ErrorHandler('Product not found', 404));
  }

  let images = []
  if (typeof req.body.images === 'string') {
      images.push(req.body.images)
  } else {
      images = req.body.images
  }

  if (images !== undefined) {

      // Deleting images associated with the product
      for (let i = 0; i < product.images.length; i++) {
          const result = await cloudionary.v2.uploader.destroy(product.images[i].public_id)
      }

      let imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
          const result = await cloudionary.v2.uploader.upload(images[i], {
              folder: 'products'
          });

          imagesLinks.push({
              public_id: result.public_id,
              url: result.secure_url
          })
      }

      req.body.images = imagesLinks

  }



  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false
  });

  res.status(200).json({
      success: true,
      product
  })
});

//Brisanje proizvoda => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  //brisanje slika 
  for(let i=0;i<product.images.length;i++){
    const result=await cloudionary.v2.uploader.destroy(product.images[i].public_id)
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product is deleted.",
  });
});

//Kreiranje novog revieewa, update posotojeceg rewieva korisnika=> /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  // u slucaju da je vec recenizirao
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString() //ako se ijedna recenzija pokapal sa ovim user idijem to znaci da je recenzirao
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//Get Product reiews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Delete Product reiews => /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
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
  });
});
