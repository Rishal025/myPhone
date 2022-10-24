var express = require('express');
const userController = require('../controllers/user-controller');
const middlewares = require('../controllers/middlewares')
const addressHelper = require('../helpers/address-Helper');
const userHelpers = require('../helpers/user-helpers');
const productHelper = require('../helpers/product-helper')
var router = express.Router();

// ===================GET HOME PAGE=============================================

router.get('/', middlewares.userAuthGuest, userController.baseRoute)

// =============================GET LOGIN==========================================

router.get('/login', userController.login)

// =================POST LOGIN====================================

router.post('/login', userController.loginpost)

// ================================GET SIGNUP====================================

router.get('/signup', userController.signUp)

// ====================================POST SIGNUP=======================================

router.post('/signup', userController.signupPost)

// ================================HOME=============================

router.get('/home', userController.home)

// ===========================GET GUESTHOME==================================

router.get('/guestHome', userController.guestHome)

// =======================GET OTP============================

router.get('/otp', userController.otp)

// ====================================POST OTPVALIDATE=====================================

router.post('/otpValidate', userController.otpValidatePost)

// ===============================OTP VALIDATE============================

router.get('/otpValidate', userController.otpValidate)

// ===================================GET VERIFY==================================

router.get('/verify', userController.verify)

// ====================================POST VERIFY====================================

router.post('/verify', userController.verifyPost)

// ===================================GET PRODUCTS========================================

router.get('/products', middlewares.products, userController.productData)


router.post('/filter-products', userController.filterProduct)

// ====================================GET CART=====================================

router.get('/cart', middlewares.userAuthLogin, userController.cart)

// ===========================GET PRODUCTVIEW ID=========================================

router.get('/product-view/:id', userController.productView)

// ============================PRODUCT VIEW REDIRECTED================================

router.get('/productView', userController.product_view)

// ==============================GET RESEND OTP===========================================

router.get('/resendotp', userController.resendOtp)

// ==============================ADD TO CART================================

router.get('/add-to-cart/:id', middlewares.userAuthLogin, userController.addToCart)

// ===============================ADD TO WISHLIST=============================

router.post('/add-to-cart-wishlist', middlewares.userAuthLogin, userController.addToWishlist)

// ================================DELETE WISHLIST============================

router.post('/delete-wishlist', middlewares.userAuthLogin, userController.deleteWishlist)

// ===============================CHANGE PRODUCT QUANTITY========================================

router.post('/change-product-quantity', middlewares.userAuthLogin, userController.changeProductQuantity)

// ==============================REMOVE CART PRODUCT======================================

router.post('/remove-products', middlewares.userAuthLogin, userController.removeCartProds)

// ========================================CONFIRM ADDRESS==================================

router.get('/confirm-address', middlewares.userAuthLogin, userController.confirmAddress)

router.post('/confirmAddress', userController.confirmAddressPost)

// =================================ADD ADDRESS================================

router.post('/add-address', middlewares.userAuthLogin, userController.addAddress)

// ==================================EDIT ADDRESS===============================

router.get('/edit-address/:value', middlewares.userAuthLogin, userController.editfillAddress)

// =================================EDIT ADDRESS===============================

router.get('/editAddress', middlewares.userAuthLogin, userController.edit_address)

// =================================UPDATE ADDRESS DATA=========================

router.post('/update-address', middlewares.userAuthLogin, userController.updateAddress)

// =================================DELETE ADDRESS============================

router.post('/delete-address', middlewares.userAuthLogin, userController.deleteAddress)

// ===================================MY ADDRESS=============================

router.get('/my-address', middlewares.userAuthLogin, userController.myAddress)

// ====================================PROCEED TO CHECKOUT================================


router.get('/proceed-to-checkout', userController.proceedToCheckout)

// ====================================FORGOT PASSWORD========================

router.get('/forgot-password',)

// ===================================PLACE ORDER==============================

router.post('/place-order', userController.placeOrder)

// ==================================VERIFY RAZORPAY PAYMENT============================

router.post('/verify-razorpay-payment', middlewares.userAuthLogin, userController.verifyRazorPay)

// ================================VERIFY PAYMENT AGAIN=============================

router.post('/verify-payment-again', middlewares.userAuthLogin, userController.verifyPaymentAgain)

// =================================ORDER SUCCESS============================

router.get('/order-success', middlewares.userAuthLogin, userController.orderSuccess)

// ==================================ORDER FAILED============================

router.get('/order-failed', middlewares.userAuthLogin, userController.orderfailed)

// ================================MY ACCOUNT============================

router.get('/account', middlewares.userAuthLogin, userController.myAccount)

// =================================MY ORDERS==========================

router.get('/orders', middlewares.userAuthLogin, userController.orders)

// ====================================ORDER DETAILS======================

router.get('/allorders', middlewares.userAuthLogin, userController.allOrder)

// =================================ORDER DETAILS REDIRECTED==============

router.get('/order-details', middlewares.userAuthLogin, userController.orderDetails)

// ================================CANCEL ORDER============================

router.post('/cancel-order', middlewares.userAuthLogin, userController.cancelOrder)

// ==================================RETURN PRODUCT=====================

router.get('/return-product', middlewares.userAuthLogin, userController.returnProduct)

// ====================================RETURN ITEM CONFIRMATION=====================

router.get('/returnItem', middlewares.userAuthLogin, userController.returnItem)

// ====================================CURRENT PASSWORD===========================

router.post('/currentPasswordAuth', middlewares.userAuthLogin, userController.currentPassAuth)

// =====================================CHANGE PASSWORD=========================

router.get('/change-password', middlewares.userAuthLogin, userController.changePassword)

// ====================================NEW PASSWORD==========================

router.get('/new-password', middlewares.userAuthLogin, userController.newPassword)

// ====================================PASSWORD CHANGED=======================

router.post('/password-changed', middlewares.userAuthLogin, userController.passwordChanged)

// ======================================USER PROFILE=========================

router.get('/user-profile', middlewares.userAuthLogin, userController.userProfile)

// =======================================PROFILE UPDATION====================

router.post('/profile-updation', middlewares.userAuthLogin, userController.userProfileUpdate)

// =======================================EXPLORE SAMSUNG====================

router.get('/explore-samsung', userController.exploreSamsung)

// ========================================EXPLORE ONEPLUS====================

router.get('/explore-oneplus', userController.exploreOneplus)

// =========================================EXPLORE APPLE====================

router.get('/explore-apple', userController.exploreApple)

// ======================================ADD ADDRESS==========================

router.get('/add-address', middlewares.userAuthLogin, userController.add_address)

// ====================================PAYPAL PAYMENT========================

router.post('/paypal-payment', middlewares.userAuthLogin, userController.payPalPayment)

// ====================================PAYMENT SUCCESS=======================

router.get('/success', userController.success)

// ===================================ADD TO WISHLIST========================

router.post('/add-to-wishlist', middlewares.userAuthLogin, userController.addtoWishlist)

// ===================================GET WISHLIST===============================

router.get('/wishlist', middlewares.userAuthLogin, userController.wishlist)

// =====================================CONFIRM COUPON=========================

router.post('/confirm-coupon', middlewares.userAuthLogin, userController.confirmCoupon)

// =====================================DELETE COUPON=======================

router.post('/delete-coupon', middlewares.userAuthLogin, userController.deleteCoupon)

// =======================================RETURN REQUEST=====================

router.post('/return-request', middlewares.userAuthLogin, userController.returnRequest)

// ======================================SEARCH RESULT========================

router.post('/searchResult', userController.searchResult)

// =======================================POPULAR BRANDS========================

router.get('/popular-brands', userController.popularBrands)

// ==================================POPULAR BRANDS RESULT=====================

router.get('/popularBrands', userController.findPopularBrands)

// ======================================LOGOUT=========================================

router.get('/logout', userController.logout)

module.exports = router;


