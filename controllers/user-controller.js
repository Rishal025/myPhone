var express = require('express');
const productHelper = require('../helpers/product-helper');
const userHelpers = require('../helpers/user-helpers');
const orderHelper = require('../helpers/orderHelper')
const categoryHelper = require('../helpers/category-helper');
const addressHelper = require('../helpers/address-Helper')
var paypal = require('paypal-rest-sdk');
const adminHelper = require('../helpers/admin-helper');
const { ObjectId } = require('mongodb');
var router = express.Router();

let errMessage = ""
let mob
let user
let changePass
let userExist
let updateSuccess
let details
let editAddress
let Orderdetails
let orderFailed
let currentPassErr
let prodViewId
let bId
let editValue

// ===============================paypal acc password - 0uD%SMnP  id- sb-b9x5i21327014@personal.example.com==================================


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_SECRET_ID
});


const Accssid = process.env.TWILIO_ACC_SSID
const authToken = process.env.TWILIO_ACC_AUTHTOKEN
const servSsid = process.env.TWILIO_SERVICE_SSID

const client = require('twilio')(Accssid, authToken)

let productData = (req, res) => {

  let products = res.paginatedResults.products
  let next = res.paginatedResults.next
  let previous = res.paginatedResults.previous
  let pages = res.paginatedResults.pages
  let pageCount = res.paginatedResults.pageCount
  let currentPage = res.paginatedResults.currentPage

  console.log('next:' + next)
  console.log('products' + products[0].stock)
  productHelper.getBrand().then((brand) => {
    console.log(brand)
    res.render('user/category-list', { userLogin: true, products, brand, next, previous, pages, pageCount, currentPage, style: true })

  }).catch((e) => {
    console.log(e)
  })
}

let baseRoute = (req, res) => {
  res.redirect('/home');
}

let login = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home')
  } else {
    res.render('user/userLogin', { userLogin: false, errMessage })
    errMessage = ""
  }
}

let loginpost = (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    console.log(response)
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.userData
      user = req.session.user
      res.redirect('/home')
    } else {
      errMessage = response.errMessage
      res.redirect('/login')
    }
  }).catch((e) => {
    console.log(e)
  })
}

let home = (req, res) => {
  cartCount = null
  console.log(req.session.user)
  userHelpers.getCartCount(user._id).then(async (cartCount) => {
    let wishlistCount = await userHelpers.getWishlistCount(user._id)
    let popularBrands = await categoryHelper.getAllBrands()
    let products = await productHelper.findProdForHome()
    console.log(popularBrands)
    res.render('user/index-1', { userLogin: true, cartCount, wishlistCount, popularBrands ,products})
  }).catch((e) => {
    console.log(e)
  })
}

let signUp = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home')
  } else {
    res.render('user/userSignup', { userLogin: false, errMessage })
    errMessage = ""
  }
}

let signupPost = (req, res) => {
  userHelpers.doSignup(req.body).then((userFind) => {
    if (userFind) {
      errMessage = "user already exists"
      res.redirect('/signup')
    } else {
      userHelpers.AddStatus(req.body).then(() => {
        res.redirect('/guesthome')
      }).catch((e) => {
        console.log(e)
      })

    }

  }).catch((e) => {
    console.log(e);
  })
}

let otp = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home')
  } else {
    res.render('user/numberLogin', { userLogin: false, errMessage })
    errMessage = ""
  }

}

let otpValidatePost = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home')
  } else {
    req.session.mobile = req.body.number
    mob = req.session.mobile
    userHelpers.getOtp(req.body).then((response) => {
      req.session.user = response.user
      user = req.session.user
      console.log('user:' + req.session.user)
      if (response.verify) {

        client.verify.services(servSsid).verifications.create({ to: `+91${mob}`, channel: "sms" }).then(() => {
          req.session.userLoginErr = false
          res.redirect('/otpValidate')
        }).catch(() => {
          console.log("user error otp")
        })
      } else {
        errMessage = response.errMessage
        res.redirect('/otp')
      }

    })

  }
}

let otpValidate = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home')
  } else {
    res.render('user/otpLogin')
  }
}

let verify = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home')
  } else {
    res.redirect('/guestHome')
  }
}

let verifyPost = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home')
  } else {

    const { otp } = req.body
    const mob = req.session.mobile
    client.verify.services(servSsid).verificationChecks.create({ to: `+91${mob}`, code: otp }).then((response) => {
      if (response.valid) {
        userHelpers.findUser(mob).then((userData) => {
          console.log(userData)
          req.session.user = userData
          user = req.session.user
          req.session.loggedIn = true
          res.redirect('/')

        }).catch((e) => {
          console.log(e)
        })
      } else {
        res.render('user/otpLogin', { valid: true })
      }

    }).catch((error) => {
      console.log(error)
    })

  }


}

let guestHome = async (req, res) => {
  try {
    let products = await productHelper.findProdForHome()
    let popularBrands = await categoryHelper.getAllBrands()
    res.render('user/index-1', { userLogout: true, popularBrands,products})
  }
  catch {
    console.log('error')
  }

}


let cart = (req, res) => {

  userHelpers.getCartProducts(user._id).then(async (products) => {
    let total = await userHelpers.getProductTotal(user._id)
    console.log(total)
    console.log('sssssssssssssssss' + products);
    if (total[0]) {
      let coupon = await productHelper.getCouponPrice(req.session.user._id, total)
      console.log('heyyyyyy')
      discountPrice = coupon[0].discountPrice
      discount = coupon[0].discountAmount
      console.log(coupon[0].discountPrice)
      let tot = total[0].grandTotal
      res.render('user/cart', { userLogin: true, products, tot, discountPrice, discount })
    } else {
      res.render('user/cart', { userLogin: true, products })
    }
    // let tot=total[0].grandTotal

  }).catch((e) => {
    console.log(e)
  })
}

let productView = (req, res) => {
  prodViewId = req.params.id
  res.redirect('/productView')
}

let product_view = (req, res) => {
  if (req.session.loggedIn) {
    let user = req.session.user._id
    let itemfound
    productHelper.productsView(prodViewId).then(async (view) => {
      cartCheck = await productHelper.findAddtoCartItems(prodViewId, user)
      items = await productHelper.findProdForHome()
      console.log(items)
      console.log(cartCheck)
      if (cartCheck.itemFound === true) {
        itemfound = true
      } else {
        itemfound = false
      }
      res.render('user/product-view', { view, userLogin: true, itemfound,items})
    }).catch((e) => {
      console.log(e)
    })

  } else {
    productHelper.productsView(prodViewId).then(async (view) => {
      items = await productHelper.findProdForHome()
      res.render('user/product-view', { view, userLogin: true,items })
    }).catch((e) => {
      console.log(e)
    })

  }
}

let resendOtp = (req, res) => {
  if (mob) {
    client.verify.services(servSsid).verifications.create({ to: `+91${mob}`, channel: "sms" }).then(() => {
      req.session.user = response.user
      req.session.userLoginErr = false
      res.redirect('/otpvalidate')
    }).catch((error) => {
      console.log(error)
    })
  }
}

let addToCart = (req, res) => {
  let id = req.params.id
  userHelpers.addtoCart(id, user._id).then(() => {
    res.redirect(req.get('referer'));
  })
}

let addToWishlist = (req, res) => {
  userHelpers.addToCartFromWishlist(req.body).then(() => {
    userHelpers.deleteWishlist(req.body).then(() => {
      console.log('success');
      res.json({ success: true })
    }).catch(() => {
      console.log('error in delete wishlist')
    })

  }).catch((e) => {
    console.log(e)
  })
}

let deleteWishlist = (req, res) => {
  userHelpers.deleteWishlist(req.body).then(() => {
    res.json({ success: true })
  }).catch(() => {
    console.log('*error deleting wishlist product*')
  })
}

let changeProductQuantity = (req, res) => {
  console.log(req.body.user);
  console.log(req.body.user);
  console.log(req.body.user);
  console.log(req.body.user);
  let obj = {}
  userHelpers.productQuantity(req.body).then(async (response) => {
    total = await userHelpers.getProductTotal(req.body.user)
    products = await userHelpers.getCartProducts(req.session.user._id)
    coupon = await productHelper.getCouponPrice(req.session.user._id, total)
    discountPrice = coupon[0].discountPrice
    discount = coupon[0].discountAmount

    obj.response = response
    obj.total = total
    obj.products = products
    obj.discountPrice = discountPrice
    obj.discount = discount
    res.json(obj)
  }).catch((e) => {
    console.log(e)
  })
}

let removeCartProds = (req, res) => {
  userHelpers.removeCartProducts(req.body).then((response) => {
    console.log(response);
    res.json(response)
  }).catch(() => {
    console.log('error remove cart product')
  })
}

let confirmAddress = async (req, res) => {

  let address = await addressHelper.findAddress(req.session.user._id)
  console.log(address);
  userHelpers.getCartProducts(req.session.user._id).then(async (response) => {
    let total = await userHelpers.getProductTotal(req.session.user._id)
    console.log(total)
    let coupon = await productHelper.getCouponPrice(req.session.user._id, total)
    console.log('heyyyyyy')
    let tot = total[0].grandTotal
    discountPrice = coupon[0].discountPrice
    discount = coupon[0].discountAmount
    console.log(coupon[0].discountPrice)


    if (discount) {
      res.render('user/add-address', { userLogin: true, response, discount, discountPrice, tot, user, address, editAddress })

    } else {
      res.render('user/add-address', { userLogin: true, response, tot, user, address, editAddress })
    }

  })
}

let confirmAddressPost = (req,res)=>{
  console.log('hiiii')
  console.log(req.body)
  addressHelper.selectAddress(req.body).then((response)=>{
    details = response
    res.json(details)
  }).catch((e)=>{
    console.log(e)
  })
}

let addAddress = (req, res) => {
  addressHelper.addAddress(req.body).then(() => {
    res.json({ status: true })
  }).catch(() => {
    console.log('error add address');
  })
}

let editfillAddress = (req, res) => {
  editValue = req.params.value;
  res.redirect('/editAddress')
}

let edit_address = (req, res) => {
  addressHelper.editFillAddress(editValue).then((result) => {
    res.render('user/edit-address', { result, userLogin: true })
  }).catch((e) => {
    console.log(e);
  })
}

let updateAddress = (req, res) => {
  addressHelper.updateAddress(req.body).then((response) => {
    res.redirect('/confirm-address')
  }).catch((e) => {
    console.log(e);
  })
}

let deleteAddress = (req, res) => {
  addressHelper.deleteAddress(req.body).then(() => {
    res.json({ status: true })
  }).catch(() => {
    console.log('error deleting address');
  })
}

let myAddress = async (req, res) => {
  try {
    let user = req.session.user._id
    let address = await addressHelper.findAddress(req.session.user._id)
    console.log('address:' + address, user)
    res.render('user/my-address', { userLogin: true, address, user })
  }
  catch {
    console('error find address')
  }

}

// let proceedToCheckout = async (req, res) => {
//   userHelpers.getCartProducts(req.session.user._id).then((response) => {
//     userHelpers.getProductTotal(req.session.user._id).then(async(total) => {
//       console.log('response');
//       console.log(response);
//       console.log('total');
//       console.log(total);
//       console.log('details')
//       console.log(details);
//       let coupon =await productHelper.getCouponPrice(req.session.user._id, total)
//       console.log('heyyyyyy')
//       let tot = total[0].grandTotal
//       discountPrice = coupon[0].discountPrice
//       discount = coupon[0].discountAmount
//       console.log(coupon[0].discountPrice)

//             res.render('user/checkout', { userLogin: true, response, tot, user ,details, discount,discountPrice})

//     })

//   })
// }

let placeOrder = async (req, res) => {
  console.log('rrrrrrrrrrrrrrr');
  console.log(req.body)
  console.log('rrrrrrrrrrrrrrr');
  let products = await orderHelper.getCartProductsList(req.body.user)
  let totalPrice = await userHelpers.getProductTotal(req.body.user)
  let coupon = await productHelper.getCouponPrice(req.session.user._id, totalPrice)
  // discountPrice = coupon[0].discountPrice
  // discount = coupon[0].discountAmount
  orderHelper.placeOrder(req.body, products, totalPrice, coupon).then(async (object) => {

    if (req.body.paymentMethod === 'COD') {

      console.log('cod');
      object.productData.forEach(element => {
        console.log('its foreach')
        userHelpers.decrementStock(element)

      });

      await productHelper.deleteCoupon(req.session.user._id)
      console.log('coupon deleted')

      res.json({ codSuccess: true })

    } else if (req.body.paymentMethod === 'Paypal') {
      console.log('paypal');
      res.json({ paypalsuccess: true, orderId: object.orderId })
    } else {
      console.log('razorpay');
      userHelpers.generateRazorpay(object.orderId, totalPrice, coupon).then((response) => {
        res.json(response)
      })
    }

  }).catch(() => {
    console.log('error placing order')
  })
}

let proceedToCheckout = async (req, res) => {
  userHelpers.getCartProducts(req.session.user._id).then((response) => {
    userHelpers.getProductTotal(req.session.user._id).then(async(total) => {
      console.log('response');
      console.log(response);
      console.log('total');
      console.log(total);
      console.log('details')
      console.log(details);
      let coupon =await productHelper.getCouponPrice(req.session.user._id, total)
      console.log('heyyyyyy')
      let tot = total[0].grandTotal
      discountPrice = coupon[0].discountPrice
      discount = coupon[0].discountAmount
      console.log(coupon[0].discountPrice)
      let user = req.session.user
          res.render('user/checkout', { userLogin: true, response, tot, user ,details, discount,discountPrice})

    })

  })
}


let verifyRazorPay = (req, res) => {
  userHelpers.verifyPayment(req.body).then(() => {
    console.log('successssssssssssssssssss')
    userHelpers.changeOrderStatusrazor(req.body['order[receipt]']).then(() => {

      res.json({ status: true })

    })
  }).catch((err) => {
    res.json({ status: false, errMes: 'payment failed' })
  })
}


let verifyPaymentAgain = (req, res) => {
  userHelpers.razorpaySuccess(req.body['order[receipt]'], req.session.user._id).then(async (orderData) => {

    console.log('req.body,user:' + req.body['order[receipt]'], req.session.user._id)

    orderData.forEach(element => {

      userHelpers.decrementStock(element)
      userHelpers.changeStatusPendingToPlaced(element)
    });

    await productHelper.deleteCoupon(req.session.user._id)

    res.json({ success: true })

  }).catch((e) => {
    console.log(e);
  })
}

let orderSuccess = (req, res) => {
  res.render('user/orderSuccess', { userLogin: true })
}

let orderfailed = (req, res) => {
  res.render('user/orderFailed', { userLogin: true })
}

let myAccount = async (req, res) => {
  try {
    userData = await userHelpers.findUserDetails(req.session.user._id)
    res.render('user/myaccount', { userLogin: true, changePass, updateSuccess, userData })
    changePass = false
    updateSuccess = false
  }
  catch {
    console.log('error occured')
  }

}

let orders = (req, res) => {
  orderHelper.getOrders(req.session.user._id).then((response) => {
    console.log('response.failed:' + response.failed);
    res.render('user/myorders', { userLogin: true, response });
  }).catch((e) => {
    console.log(e);
  })
}

let allOrder = (req, res) => {
  console.log(req.query);
  orderHelper.getAllOrders(req.query.id).then(async (response) => {
    let billing = await orderHelper.findAddress(req.query.id)

    response.forEach(element => {

      if (element.orderStatus === 'Delivered') {
        element.delivered = true
      } else {
        element.delivered = false
      }

      if (element.orderStatus === 'Cancelled') {
        element.cancelled = true
      } else {
        element.cancelled = false
      }

      if (element.orderStatus === 'Request pending') {
        element.returnRequest = true
      } else {
        element.returnRequest = false
      }

      if (element.orderStatus === 'Request approved') {
        element.returnApproved = true
      } else {
        element.returnApproved = false
      }


    });

    Orderdetails = response
    address = billing
    res.redirect('/order-details')

  }).catch((e) => {
    console.log(e);
  })
}

let orderDetails = (req, res) => {
  res.render('user/order-details', { userLogin: true, Orderdetails, address })
}

let cancelOrder = (req, res) => {
  orderHelper.cancelOrder(req.body).then((response) => {
    productHelper.incrementStock(req.body).then((result) => {
      res.json({ status: true })
      console.log('cancelled order');
    }).catch((e) => {
      console.log(e);
    })

  }).catch((e) => {
    console.log(e);
  })

}

let returnProduct = (req, res) => {
  req.session.prodId = req.query.prodId
  req.session.quantity = req.query.quantity
  req.session.orderId = req.query.orderId
  res.redirect('/returnItem')
}

let returnItem = (req, res) => {
  productHelper.getreturnProductDetails(req.session.prodId).then((products) => {
    let quantity = req.session.quantity
    let orderId = req.session.orderId
    let prodId = req.session.prodId
    res.render('user/return-form', { userLogin: true, products, quantity, orderId, prodId })

  }).catch((e) => {
    console.log(e);
  })
}

let currentPassAuth = (req, res) => {
  userHelpers.confirmCurrentPassword(req.body, req.session.user._id).then((response) => {
    console.log('response' + response.err)
    if (response.err === true) {
      console.log('true');
      currentPassErr = true
      res.redirect('/change-password')
    } else {
      console.log('false')
      res.redirect('/new-password')
    }
  }).catch(() => {
    console.log('error current password');
  })
}

let changePassword = (req, res) => {
  res.render('user/old-password', { currentPassErr })
  currentPassErr = ""
}

let newPassword = (req, res) => {
  res.render('user/change-password')
}

let passwordChanged = (req, res) => {
  userHelpers.changePassword(req.body, req.session.user._id).then(() => {
    res.redirect('/account')
    changePass = true
  }).catch(() => {
    console.log('error changing password');
  })

}

let userProfile = (req, res) => {
  userHelpers.getUserDetails(req.session.user._id).then((user) => {
    res.render('user/user-profile', { userLogin: true, user, userExist })
    userExist = false
  }).catch(() => {
    console.log('error user profile');
  })

}

let userProfileUpdate = (req, res) => {
  userHelpers.userProfileUpdate(req.body, req.session.user._id).then((response) => {
    if (response.userExist) {
      userExist = true
      res.redirect('/user-profile')

    } else {
      updateSuccess = true
      res.redirect('/account')
    }

  })
}

let exploreSamsung = (req, res) => {
  categoryHelper.getSamsung().then((result) => {
    res.render('user/samsung', { result, userLogin: true })
  }).catch(() => {
    console.log('error exploring samsung');
  })
}

let exploreOneplus = (req, res) => {
  categoryHelper.getOneplus().then((result) => {
    res.render('user/oneplus', { result, userLogin: true })
  }).catch(() => {
    console.log('error exploring oneplus');
  })
}

let exploreApple = (req, res) => {
  categoryHelper.getApple().then((result) => {
    res.render('user/apple', { result, userLogin: true })
  }).catch(() => {
    console.log('error exploring apple');
  })
}

let add_address = (req, res) => {
  res.render('user/address', { userLogin: true })
}

let payPalPayment = (req, res) => {
  let orderId = req.body.orderId
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success/?orderId=" + orderId,
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Red Sox Hat",
          "sku": "001",
          "price": "25.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "25.00"
      },
      "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.json(payment.links[i].href);
        }
      }
    }
  });

}

let success = (req, res) => {
  const orderId = req.query.orderId
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  }

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      userHelpers.afterSuccessPaypal(orderId, req.session.user._id).then((orderData) => {
        userHelpers.changeOrderStatusrazor(orderId).then(() => {

          orderData.forEach(element => {

            userHelpers.decrementStock(element)
            userHelpers.changeStatusPendingToPlaced(element)
          });
        })
        res.redirect('/order-success')
      }).catch(() => {
        console.log('error payment success');
      })

    }
  });
}

let addtoWishlist = (req, res) => {
  if (req.session.loggedIn) {
    console.log('req.session:' + req.session.user._id)
    req.body.user = req.session.user._id
    productHelper.moveToWishlist(req.body).then(() => {
      console.log('successfully added')
      res.json({ status: true })
    }).catch((e) => {
      console.log(e)
    })
  } else {
    res.redirect('/login')
  }

}

let wishlist = (req, res) => {
  if (req.session.loggedIn) {
    productHelper.getWishlist(req.session.user._id).then((products) => {
      console.log(products)
      let notFound = products.wishlistNotFount
      console.log('notFound:' + notFound)
      res.render('user/wishlist', { userLogin: true, products, notFound })
    }).catch((e) => {
      console.log(e)
    })
  } else {
    res.redirect('/login')
  }
}

let confirmCoupon = async (req, res) => {
  let userId = req.session.user._id
  let total = await userHelpers.getCartProducts(userId)
  productHelper.confirmCoupon(req.body, userId, total).then((response) => {
    console.log('confirmed')
    console.log(response)
    res.json(response)
  }).catch((e) => {
    console.log(e)
  })
}

let deleteCoupon = (req, res) => {
  console.log('reached')
  let userId = req.session.user._id
  productHelper.removeCoupon(userId).then(() => {
    console.log('deleted successfully')
    res.json({ success: true })
  })
}

let returnRequest = (req, res) => {
  console.log('retun request route')
  adminHelper.returnRequest(req.body).then(() => {
    console.log('success')
    res.json({ status: true })
  }).catch((e) => {
    console.log(e)
  })
}

let searchResult = (req, res) => {
  let payload = req.body.payload.trim();
  console.log(payload);
  userHelpers.searchResult(payload).then((result) => {
    console.log(result)
    res.send({ payload: result });

  }).catch((e) => {
    console.log(e)
  })
}

let popularBrands = (req, res) => {
  bId = req.query.bId
  res.redirect('/popularBrands')
}

let findPopularBrands = (req, res) => {
  categoryHelper.findAllBrand(bId).then((products) => {
    res.render('user/brand-list', { userLogin: true, products })
  })
}

let filterProduct = (req, res) => {
  productHelper.filterProducts(req.body).then((result) => {
    console.log(result)
    res.render('user/filterResult',{userLogin:true,result})
  })
}


let logout = (req, res) => {
  req.session.loggedIn = ""
  console.log('destroyed');
  res.redirect('/guestHome')
}


module.exports = {
  productData,
  baseRoute,
  login,
  loginpost,
  home,
  signUp,
  signupPost,
  otp,
  otpValidatePost,
  otpValidate,
  verify,
  verifyPost,
  guestHome,
  cart,
  productView,
  product_view,
  resendOtp,
  addToCart,
  addToWishlist,
  deleteWishlist,
  changeProductQuantity,
  removeCartProds,
  confirmAddress,
  // confirmAddressPost
  addAddress,
  editfillAddress,
  edit_address,
  updateAddress,
  deleteAddress,
  myAddress,
  proceedToCheckout,
  placeOrder,
  verifyRazorPay,
  verifyPaymentAgain,
  orderSuccess,
  orderfailed,
  myAccount,
  orders,
  allOrder,
  orderDetails,
  cancelOrder,
  returnProduct,
  returnItem,
  currentPassAuth,
  changePassword,
  newPassword,
  passwordChanged,
  userProfile,
  userProfileUpdate,
  exploreSamsung,
  exploreOneplus,
  exploreApple,
  add_address,
  payPalPayment,
  success,
  addtoWishlist,
  wishlist,
  confirmCoupon,
  deleteCoupon,
  returnRequest,
  searchResult,
  popularBrands,
  findPopularBrands,
  filterProduct,
  confirmAddressPost,
  logout
}