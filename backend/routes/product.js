const express=require('express');
const router=express.Router();
//povezivaje preko funkija product.js i productController.js
const{
    getProducts, 
    newProduct,
    getSingleProduct,
    UpdateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReview,
    getAdminProducts
}=require('../controllers/productController')

const{isAuthenticatedUser, authorizeRoles}=require('../middlewares/auth');

//za dobijanje produkata 
router.route('/products').get(getProducts)
router.route('/admin/products').get(getAdminProducts)
router.route('/product/:id').get(getSingleProduct)

//dodavanje proizvoda admin
router.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles('admin'),newProduct);

//update i brisanje proizvoda na osnovu id-a admin
router.route('/admin/product/:id')
                    .put(isAuthenticatedUser,authorizeRoles('admin'),UpdateProduct)
                    .delete(isAuthenticatedUser,authorizeRoles('admin'),deleteProduct);


//dodavanje i updateovanje recenzija, kao i dobijanje svih
router.route('/review').put(isAuthenticatedUser,createProductReview)
router.route('/reviews').get(isAuthenticatedUser,getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser,deleteReview)

module.exports=router;

