var express = require('express');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helper');
var productHelper = require('../helpers/product-helper');
const orderHelper = require('../helpers/orderHelper');
const categoryHelper = require('../helpers/category-helper');
const { upload } = require('../public/javascripts/fileupload');
const reportHelper = require('../helpers/reportHelper');
const { ObjectId } = require('mongodb');

const Accssid = process.env.TWILIO_ACC_SSID
const authToken = process.env.TWILIO_ACC_AUTHTOKEN
const servSsid = process.env.TWILIO_SERVICE_SSID

const client = require('twilio')(Accssid, authToken)

const credential = {
    email: process.env.ADMIN_USERID,
    password: process.env.ADMIN_PASSWORD,
    phone: 9074642365
}
let id
let responseCat
let responseErr
let responsebr
let responseErrbr
let brandUpdateSuccess

// let adminAuth = if(req.session.adminLogin === true)

let adminLogin = (req, res, next) => {
    if (req.body.email == credential.email && req.body.password == credential.password) {
        console.log('logged In');
        req.session.adminLogin = true
        res.redirect('/admin')
    } else {
        console.log('wrong pass')
        res.render('admin/admin-login', { errMessage: true })
    }
}

let adminSalesReport = async (req, res, next) => {
    if (req.session.adminLogin) {
        let weeklySales = await adminHelpers.getSalesReportByWeek()
        let monthlySales = await adminHelpers.getSalesReportByMonth()
        let yearlySales = await adminHelpers.getSalesReportByYear()
        let codSales = await adminHelpers.codSales()
        let razorSales = await adminHelpers.razorSales()
        let paypalSales = await adminHelpers.paypalSales()

        res.render('admin/admin-index', { admin: true, weeklySales, monthlySales, yearlySales, codSales, razorSales, paypalSales })

    } else {
        res.render('admin/admin-login')

    }
}

let userData = (req, res) => {
    adminHelpers.getAllUsers().then((users) => {
        res.render('admin/admin-userDetails', { users, admin: true })
    }).catch((e) => {
        console.log(e)
    })
}

let logout = (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
}

let blockUser = (req, res) => {
    console.log(req.params);
    let id = req.params.id
    adminHelpers.blockUser(id).then((response) => {
        res.redirect('/admin/viewuser')
    }).catch((e) => {
        console.log(e)
    })
}

let unBlock = (req, res) => {
    console.log(req.params);
    let id = req.params.id
    adminHelpers.unBlockUser(id).then((response) => {
        res.redirect('/admin/viewuser')
    }).catch((e) => {
        console.log(e)
    })
}

let prodData = (req, res) => {
    productHelper.getAllProductsAdmin().then((products) => {
        res.render('admin/product', { products, admin: true })
    }).catch((e) => {
        console.log(e)
    })
}

let addProducts = async (req, res) => {
    try {
        let brand = await productHelper.getBrand()
        res.render('admin/add-product', { brand, admin: true })
    }
    catch (error){
        console.log(error)
    }
}

let loginOtp = (req, res) => {
    res.render('admin/admin-otpNum')
}

let otpValidate = (req, res) => {
    if (credential.phone == req.body.phone) {
        const mob = credential.phone
        client.verify.services(servSsid).verifications.create({ to: `+91${mob}`, channel: "sms" }).then(() => {
            res.render('admin/admin-otpVal')
        }).catch(() => {
            console.log("user error otp")
        })

    } else {
        res.redirect('otpValidate')
    }
}

let validation = (req, res) => {
    const otp = req.body.otp
    let mob = credential.phone
    client.verify.services(servSsid).verificationChecks.create({ to: `+91${mob}`, code: otp }).then((response) => {
        if (response.valid) {
            req.session.user = true
            req.session.adminLogin = true
            res.redirect('/admin')
        } else {
            res.render('user/otpLogin', { valid: true })
        }
    }).catch((error) => {
        console.log(error)
    })
}

let userView = (req, res) => {
    adminHelpers.getAllUsers().then((users) => {
        res.render('admin/admin-userDetails', { users })
    }).catch((error) => {
        console.log(error)
    })
}

let orders = (req, res) => {
    orderHelper.getAllOrdersAdmin().then((response) => {
        console.log(response);
        res.render('admin/order', { admin: true, response })
    }).catch((e) => {
        console.log(e)
    })
}

let deleteProd = (req, res) => {
    let { id } = req.params
    console.log(id);
    adminHelpers.softDelProd(id).then((response) => {
        res.redirect('/admin/product')
    }).catch((e) => {
        console.log(e)
    })
}

let undoDel = (req, res) => {
    let { id } = req.params
    console.log(id);
    adminHelpers.undoProd(id).then((response) => {
        res.redirect('/admin/product')
    }).catch((e) => [
        console.log(e)
    ])
}

let editProd = (req, res) => {
    id = req.params.id
    if (ObjectId.isValid(id)){
        productHelper.getProductDetails(id).then((product) => {

            productHelper.getBrand().then((brand) => {
                res.render('admin/admin-edit', { product, brand, admin: true })
            }).catch((e) => {
                console.log(e)
            })
        }).catch((e) => {
            console.log(e)
        })
    }else{
        res.redirect('/admin/*')
    }
    
}

let editProductPost = async(req, res) => {
    console.log(req.body)
    let id = req.params.id;
    let oldProdDetails= await productHelper.getProductDetails(id)
    const file = req.files
    let filename
  req.body.img =(req.files.length!=0) ? (filename = file.map((file)=>{ return file.filename })) : oldProdDetails.img
    productHelper.updateProduct(req.params.id, req.body).then(() => {

        res.redirect('/admin/product')
        
    }).catch(() => {
        console.log('error')
    })
}

let management = (req, res) => {
    categoryHelper.getAllBrands().then((response) => {
        res.render('admin/managements', { admin: true, responseErrbr, responsebr, response })
    }).catch((error) => {
        console.log(error);
    })
    responsebr = ""
    responseErrbr = ""
}

let managementsPostMethod = (req, res) => {
    console.log(req.body);
    productHelper.catManagement(req.body).then((response) => {
        responseCat = response.success
        responseErr = response.failed
        res.redirect('/admin/management')
    })
}

let addBrands = (req, res) => {
    res.render('admin/add-brand', { admin: true, responsebr, responseErrbr })
}

// let deleteBrand = 
let editBrand = (req, res) => {
    console.log(req.params.id);
    if(ObjectId.isValid(req.params.id)){
        categoryHelper.findBrand(req.params.id).then((brand) => {
            res.render('admin/edit-brand', { brand, admin: true, brandUpdateSuccess })
            brandUpdateSuccess = ""
        }).catch((e) => {
            console.log(e);
        })
    }else{
        res.redirect('/admin/*')
    }
   
}

let updateBrand = async(req, res) => {
    console.log(req.body);
    let bId = req.body.id
    let oldBrandDetails= await categoryHelper.findAllBrand(bId)
    const file = req.files
    let filename
  req.body.img =(req.files.length!=0) ? (filename = file.map((file)=>{ return file.filename })) : oldBrandDetails.img
    categoryHelper.updateBrand(req.body).then((response) => {
        if (response.success) {
            brandUpdateSuccess = true
            res.redirect('/admin/management')
        }
    })
}

let orderDetails = (req, res) => {
    console.log(req.params.id)
    if (ObjectId.isValid(req.params.id)) {
        orderHelper.orderDetails(req.params.id).then((order) => {
            orderHelper.findAddress(req.params.id).then((billing) => {
                console.log('result');
                console.log(order);
                console.log('result');
                console.log(billing);
                res.render('admin/order-details', { admin: true, order, billing })
            }).catch((e) => {
                console.log(e);
            })
        }).catch((e) => {
            console.log(e);
        })
    } else {
        res.redirect('/admin/*')
    }

}

let changeStatus = (req, res) => {
    orderHelper.changeStatus(req.body).then((response) => {
        res.json({ status: true })
    }).catch((e) => {
        console.log(e);
    })
}

let couponDetails = (req, res) => {
    adminHelpers.getCoupon().then((coupon) => {
        console.log(coupon)
        res.render('admin/manage-coupons', { admin: true, coupon })
    }).catch((e) => {
        console.log(e)
    })
}

let addCoupon = (req, res) => {
    adminHelpers.addCoupon(req.body).then(() => {
        res.redirect('/admin/coupon')
    }).catch((e) => {
        console.log(e);
    })
}

let deleteCoupon = (req, res) => {
    adminHelpers.deleteCoupon(req.body).then(() => {
        res.json({ status: true })
    }).catch(() => {
        console.log('error')
    })
}

let brandOffer = async (req, res) => {
    let brandOffer = await adminHelpers.getBrandOffer()
    let brand = await productHelper.getBrand()
    res.render('admin/brandOffer', { admin: true, brand, brandOffer })
}

let addBrandOffer = (req, res) => {
    adminHelpers.addBrandOffer(req.body).then((brandId) => {
        adminHelpers.findProducts(brandId).then((products) => {
            products.forEach(element => {
                adminHelpers.brandOfferCalc(req.body, element)
                console.log('success')
                res.redirect('/admin/brand-offer')
            })

        }).catch((e) => {
            console.log(e)
        })

    })

}

let deleteBrandOffer = (req, res) => {
    console.log(req.body);
    adminHelpers.deleteBrandOffer(req.body).then((brandId) => {
        console.log(brandId);
        adminHelpers.findProductForBrandOfferRemove(brandId).then((products) => {
            adminHelpers.removeBrandOffer(products)
            console.log('successfully deleted')
            res.json({ success: true })
        }).catch((e) => {
            console.log(e)
        })
    }).catch(() => {
        console.log('error')
    })
}

let salesReport = async (req, res) => {
    let weeklySales = await adminHelpers.getSalesReportByWeek()
    let monthlySales = await adminHelpers.getSalesReportByMonth()
    let yearlySales = await adminHelpers.getSalesReportByYear()
    let weeklyTotal = await adminHelpers.weeklyTotal()
    let monthlyTotal = await adminHelpers.monthlyTotal()
    let yearlyTotal = await adminHelpers.yearlyTotal()

    res.render('admin/sales-report', { admin: true, weeklySales, monthlySales, yearlySales, weeklyTotal, monthlyTotal, yearlyTotal })
}

let returnRequest = (req, res) => {
    adminHelpers.getReturnRequests().then((returnData) => {
        console.log(returnData)
        returnData.forEach((element) => {
            if (element.status === 'Request approved') {
                element.approved = true
            } else {
                element.approved = false
            }
        })
        console.log(returnData)
        res.render('admin/return-request', { admin: true, returnData })
    }).catch((e) => {
        console.log(e)
    })

}

let approveReturn = (req, res) => {
    adminHelpers.approveReturn(req.body).then(() => {
        console.log('success')
        res.json({ success: true })
    }).catch(() => {
        console.log('error')
    })
}

let deleteBrand = (req, res) => {
    categoryHelper.deleteBrand(req.body).then((response) => {
        res.json({ status: true })
    }).catch((e) => {
        console.log(e);
    })
  }






module.exports = {
    adminLogin,
    adminSalesReport,
    userData,
    logout,
    blockUser,
    unBlock,
    prodData,
    addProducts,
    loginOtp,
    otpValidate,
    validation,
    userView,
    orders,
    deleteProd,
    undoDel,
    editProd,
    editProductPost,
    management,
    managementsPostMethod,
    addBrands,
    deleteBrand,
    editBrand,
    updateBrand,
    orderDetails,
    changeStatus,
    couponDetails,
    addCoupon,
    deleteCoupon,
    brandOffer,
    addBrandOffer,
    deleteBrandOffer,
    salesReport,
    returnRequest,
    approveReturn
}