var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { get, response } = require('../app')
const { reject } = require('bcrypt/promises')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { resolve } = require('path')

var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_SECRET_KEY,
});

// =====================================doSignup===============================================================


module.exports = {
    doSignup: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let userFind = await db.get().collection(collection.SIGNUP_COLLECTION).findOne({ $or: [{ email: userData.email }, { phone: userData.phone }] })
                console.log(userFind);
                if (userFind) {
                    console.log('already existed');
                    resolve(userFind)
                } else {
                    console.log('new user');
                    userData.password = await bcrypt.hash(userData.password, 10)
                    db.get().collection(collection.SIGNUP_COLLECTION).insertOne(userData).then((data) => {
                        response.signupstatus = true
                        response.userData = userData
                        resolve();
                    }).catch(() => {
                        reject()
                    })
                }

            }
            catch {
                reject(error)
            }
        })
    },


    // ===================doLogin==========================================================================================

    doLogin: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            try {

                let loginStatus = false
                let response = {}
                let authUser = await db.get().collection(collection.SIGNUP_COLLECTION).findOne({ email: userData.email })
                if (authUser) {

                    console.log('authuser:' + authUser);
                    if (authUser.signupstatus) {
                        bcrypt.compare(userData.password, authUser.password).then((current) => {
                            console.log('++++++++++++++++++++++++++++++++++++++++');
                            console.log(current);
                            console.log('++++++++++++++++++++++++++++++++++++++++');
                            if (current) {
                                console.log('homepage');
                                response.userData = authUser
                                response.status = true
                                resolve(response)
                            } else {
                                console.log('login failed');
                                response.status = false
                                response.errMessage = "invalid password"
                                resolve(response)

                            }
                        })
                    } else {
                        response.status = false
                        response.errMessage = 'you are restricted'
                        resolve(response)
                    }
                } else {
                    console.log('login failed');
                    response.status = false
                    response.errMessage = "invalid username"
                    resolve(response)
                }
            }
            catch {
                reject(error)
            }


        })
    },

    // ======================getOtp============================================================================

    getOtp: async (userData) => {
        let response = {}
        console.log(userData.number);
        let mob = userData.number
        return new Promise(async (resolve, reject) => {
            user = await db.get().collection(collection.SIGNUP_COLLECTION).findOne({ phone: mob })
            console.log(user);
            if (user) {
                if (user.signupstatus == false) {
                    response.verify = false
                    response.errMessage = 'you are restricted'
                    resolve(response)
                } else {
                    response.verify = true
                    response.user = user
                    resolve(response)
                }

            } else {
                response.verify = false
                response.errMessage = 'enter a valid number'
                resolve(response)
            }

        })
    },

    findUser: (mobile) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SIGNUP_COLLECTION).findOne({ phone: mobile }).then((userData) => {
                resolve(userData)
            }).catch((e) => {
                console.log(e)
            })
        })
    },



    // ========================================ADD TO CART=====================================

    addtoCart: (prodId, userId) => {
        let prodObj = {
            item: objectId(prodId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let prodExist = userCart.products.findIndex(products => products.item == prodId)
                console.log(prodExist);
                console.log('[[[[[[[[[[[[[[[[[[[[[[[');
                if (prodExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(prodId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve(response)
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: prodObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }


            } else {
                console.log('elseeeeeeeeeeeeeeeeeeeeeeeee');
                let cartObj = {
                    user: objectId(userId),
                    products: [prodObj]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })

            }
        })

    },

    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        user: 1
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    },
                },
                {
                    $project: {
                        item: 1, quantity: 1, user: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $addFields: {
                        convertedPrice: { $toInt: '$product.price' },
                        convertedQty: { $toInt: "$quantity" }
                    }
                },

                {
                    $project: {
                        total: { $multiply: ['$convertedPrice', '$convertedQty'] }, item: 1, quantity: 1, product: 1, user: 1

                    }
                }

            ]).toArray().then((cartItems) => {
                console.log('cartitems')
                console.log(cartItems);

                resolve(cartItems)
            }).catch((error) => {
                reject(error)
            })


        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (cart) {
                    count = cart.products.length
                }
                resolve(count)
            }
            catch {
                reject(error)
            }

        })
    },

    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wishlist) {
                count = await db.get().collection(collection.WISHLIST_COLLECTION).countDocuments({ user: objectId(userId) })
                console.log('count wishlist:' + count)
            }
            resolve(count)
        })
    },
    productQuantity: ({ cart, product, count, quantity, user }) => {
        console.log(cart, product, count)
        count = parseInt(count),
            quantity = parseInt(quantity)

        return new Promise((resolve, reject) => {
            let object = {}
            if (count == -1 && quantity == 1) {
                object.minus = true
                resolve(object)
            } else {

                if (count != -1) {


                    db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(product) }).then((products) => {

                        console.log('products stock:' + products.stock)
                        if (quantity >= products.stock) {
                            object.ourOfStock = false
                            resolve(object)
                        } else {
                            db.get().collection(collection.CART_COLLECTION)
                                .updateOne({ _id: objectId(cart), 'products.item': objectId(product) },
                                    {
                                        $inc: { 'products.$.quantity': count }
                                    }).then((response) => {
                                        console.log('response:' + response);
                                        object.ourOfStock = true
                                        resolve(object)
                                    })
                        }
                    }).catch((error) => {
                        reject(error)
                    })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ _id: objectId(cart), 'products.item': objectId(product) },
                            {
                                $inc: { 'products.$.quantity': count }
                            }).then((response) => {
                                console.log('response:' + response);
                                object.ourOfStock = true
                                resolve(object)
                            }).catch((error) => {
                                reject(error)
                            })
                }

            }


        })
    },

    removeCartProducts: ({ cart, product }) => {
        console.log('???????????????????????????/');
        console.log(cart, product);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(cart) },
                {
                    $pull: { products: { item: objectId(product) } }
                }
            ).then(() => {
                resolve(true)
            }).catch(() => {
                reject()
            })
        })

    },

    getProductTotal: (userId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    },
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $addFields: {
                        convertedPrice: { $toInt: '$product.price' },
                        convertedQty: { $toInt: "$quantity" }
                    }
                },

                {
                    $group: {
                        _id: null,
                        grandTotal: {
                            $sum: { $multiply: ['$convertedPrice', '$convertedQty'] }
                        }
                    }
                }

            ]).toArray().then((response) => {
                console.log('****************************')
                resolve(response)
            })

        })
    },

    // =======================addstatus==================================================================================

    AddStatus: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            try {
                unBlock = await db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ email: userData.email }, { $set: { signupstatus: true } })
                resolve()
            }
            catch {
                reject(error)
            }

        })
    },


    //  ===========================================CONFIRM OLD PASSWORD====================================


    confirmCurrentPassword: (password, userId) => {

        return new Promise((resolve, reject) => {
            let response = {}
            console.log('userId:' + userId, password)
            db.get().collection(collection.SIGNUP_COLLECTION).findOne({ _id: ObjectId(userId) }).then(async (userData) => {

                let result = await bcrypt.compare(password.password, userData.password)

                if (result) {
                    console.log('ifff')
                    response.err = false
                    resolve(response)
                } else {
                    console.log('else');
                    response.err = true
                    resolve(response)
                }
                resolve()
            }).catch(() => {
                reject()
            })
        })

    },


    //  ========================================CHANGE PASSWORD============================================

    changePassword: (data, userId) => {

        return new Promise(async (resolve, reject) => {
            data.password = await bcrypt.hash(data.password, 10)
            db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { password: data.password } }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    getUserDetails: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let userProfile = await db.get().collection(collection.SIGNUP_COLLECTION).findOne({ _id: ObjectId(userId) })

                resolve(userProfile)
            }
            catch {
                reject()
            }

        })
    },

    userProfileUpdate: (userData, userId) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let userFind = await db.get().collection(collection.SIGNUP_COLLECTION).findOne(({ email: userData.email, _id: { $ne: ObjectId(userId) } }))
            if (userFind) {
                response.userExist = true
                resolve(response)
            } else {
                db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $set: {
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        inlineRadioOptions: userData.inlineRadioOptions
                    }
                }).then(() => {
                    response.userExist = false
                    resolve(response)
                })
            }
        })
    },


    generateRazorpay: (orderId, total, coupon) => {
        console.log('??????????????????');
        console.log(orderId, total);
        console.log('??????????????????');
        return new Promise((resolve, reject) => {
            if (coupon[0].discountPrice) {
                var options = {
                    amount: coupon[0].discountPrice * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
            } else {

                var options = {
                    amount: total[0].grandTotal * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
            }

            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('razor payyyyyyyyyyyy');
                    console.log(order);
                    resolve(order)
                }
            });
        })
    },

    verifyPayment: (details) => {
        console.log('details');
        console.log(details);
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'LwCYMNILRX63OEKmwIzORX0f')

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                console.log('iffffff+++++++++++++++++++');
                resolve()
            } else {
                console.log('elseeeeeee________________');
                reject()
            }
        })
    },

    razorpaySuccess: (orderId, userId) => {
        console.log('userIdddddddddddddd');
        console.log(userId);
        console.log('userIdddddddddddddd');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })

            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: "$products.item",
                        quantity: "$products.quantity"
                    }
                }
            ]).toArray().then((productData) => {


                resolve(productData)

            }).catch((error) => {
                reject(error)
            })

        })
    },

    changeOrderStatusrazor: (orderId) => {
        console.log('orderId:' + orderId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }).then(() => {
                    resolve()
                })
        })
    },

    afterSuccessPaypal: (orderId, userId) => {

        return new Promise((resolve, reject) => {

            try {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })
                db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: "$products.quantity"
                        }
                    }
                ]).toArray().then((productData) => {


                    resolve(productData)

                })

            }
            catch {
                reject()
            }


        })

    },

    changeStatusPendingToPlaced: ({ _id, item, quantity }) => {
        console.log('destructures:' + _id, item);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: _id, "products": { $elemMatch: { "item": item } } },
                {
                    $set: { "products.$.odrStatus": "order Placed" }
                })
            resolve(response)
        })
    },

    decrementStock: ({ _id, item, quantity }) => {
        console.log('hellllooooooooooooooooooo');
        console.log('decrement:' + _id, item, quantity)

        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: item },
            {
                $inc: {
                    stock: -quantity
                }

            })


    },

    addToCartFromWishlist: ({ userId, prodId, wishlistId }) => {
        console.log('req.body:' + userId, prodId, wishlistId)
        let prodObj = {
            item: objectId(prodId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let prodExist = userCart.products.findIndex(products => products.item == prodId)
                console.log(prodExist);
                if (prodExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(prodId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve(response)
                            }).catch((e) => {
                                reject(e)
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: prodObj }
                            }
                        ).then((response) => {
                            resolve()
                        }).catch((e) => {
                            console.log(e)
                        })
                }


            } else {
                console.log('elseeeeeeeeeeeeeeeeeeeeeeeee');
                let cartObj = {
                    user: objectId(userId),
                    products: [prodObj]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {

                    resolve()


                })

            }
        })

    },

    deleteWishlist: ({ userId, prodId, wishlistId }) => {
        console.log('deletewishlist:' + wishlistId, userId, prodId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).deleteOne({ _id: ObjectId(wishlistId) }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    searchResult: (payload) => {
        console.log(payload)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ productname: { '$regex': '^' + payload + '.*', $options: 'i' } }).limit(10).toArray().then((result) => {
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })

    },

    findUserDetails: (userId) => {
        console.log(userId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SIGNUP_COLLECTION).findOne({ _id: ObjectId(userId) }).then((response) => {
                resolve(response)
            }).catch((e) => {
                reject(e)
            })
        })
    }

}





