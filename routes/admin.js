var express = require('express');
var router = express.Router();
let controllers = require('../controllers/admin-controller');
const categoryHelper = require('../helpers/category-helper');
let productHelper = require('../helpers/product-helper')
const { upload } = require('../public/javascripts/fileupload');


// ===================================ADMIN=================================

router.get('/', controllers.adminSalesReport)

// ==============================POST ADMIN LOGIN================================

router.post('/adminLogin', controllers.adminLogin)

// ====================================GET VIEW USER====================================

router.get('/viewuser', controllers.userData)

// // ==================================GET LOGOUT==================================

router.get('/logout', controllers.logout)

// // =============================GET BLOCK=======================

router.get('/block/:id', controllers.blockUser)

// // ===============================UNBLOCK=======================

router.get('/unBlock/:id', controllers.unBlock)

// // ===================================GET PRODUCT==========================

router.get('/product', controllers.prodData)

// // ============================GET ADD PRODUCTS===========================

router.get('/add-product', controllers.addProducts)

// // ==============================GET ADD PRODUCTS===============================

router.post('/addproduct', upload.array('image'), controllers.addProdPost)

// // ================================GET OTP LOGIN===================================

router.get('/loginOtp', controllers.loginOtp)

// // =====================================OTP VALIDATE==============================

router.post('/otpValidate', controllers.otpValidate)

// // ==================================VALIDATION===================================

router.post('/validation', controllers.validation)

// // ====================================GET VIEW USER=====================================

router.get('/viewuser', controllers.userView)

// // ======================================GET ORDERS=============================

router.get('/orders', controllers.orders)

// // ======================================DELETE===================================

router.get('/delete/:id', controllers.deleteProd)

// ======================================undoDelete===================================

router.get('/undo/:id', controllers.undoDel)

// // ===================================EDIT=====================================

router.get('/edit/:id', controllers.editProd)

// // =======================================EDIT PRODUCT==============================

router.post('/edit-product/:id',upload.array('image'), controllers.editProductPost)

// // ===========================MANAGEMENTS==================================

router.get('/management', controllers.management)

// ================================MANAGEMENT POST=============================

router.post('/management', controllers.managementsPostMethod)

// ==================================BRAND MANAGEMENT========================

router.post('/brand-management', upload.any('thumbnail'), (req, res) => {
  const files = req.files

  const file = files.map((file) => {
    return file
  })

  const fileName = file.map((file) => {
    return file.filename
  })
  const product = req.body
  product.img = fileName

  productHelper.brandManagement(product).then(function (response) {

    responsebr = response.brandsuccess;
    responseErrbr = response.brandfailed;
    res.redirect('/admin/add-brand');

  })

  })

// ==========================ADD BRAND=========================

router.get('/add-brand', controllers.addBrands)

// ============================DELETE BRAND========================

router.post('/delete-brand', controllers.deleteBrand)

// ==============================EDIT BRAND=========================

router.get('/edit-brand/:id',  controllers.editBrand)

// =============================UPDATE BRAND===========================

router.post('/update-brand', upload.array('thumbnail'), controllers.updateBrand)

// ===========================ORDER DETAILS========================

router.get('/order-details/:id', controllers.orderDetails)

// ==========================CHANGE STATUS=======================

router.post('/changeStatus', controllers.changeStatus)

// =========================COUPON DETAILS====================

router.get('/coupon', controllers.couponDetails)

// ============================ADD COUPON===================

router.post('/add-coupon', controllers.addCoupon)

// ======================DELETE COUPON====================

router.post('/delete-coupon', controllers.deleteCoupon)

// ========================BRAND OFFER====================

router.get('/brand-offer', controllers.brandOffer)

// ===========================ADD BRAND OFFER====================

router.post('/add-brandOffer', controllers.addBrandOffer)

// =========================DELETE BRAND OFFER===================

router.post('/delete-brand-offer', controllers.deleteBrandOffer)

// =========================SALES REPORT=======================

router.get('/sales-report', controllers.salesReport)

// ==========================RETURN REQUEST====================

router.get('/return-requests', controllers.returnRequest)

// =========================APPROVE RETURN====================

router.post('/approve-return', controllers.approveReturn)



module.exports = router;




