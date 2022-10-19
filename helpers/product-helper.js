var db = require('../config/connection')
var collection = require('../config/collection');
const { ObjectId, Collection } = require('mongodb');
const { reject } = require('bcrypt/promises');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId


module.exports = {


    addProduct: (product, callback) => {

        let stock = parseInt(product.stock)
        product.stock = stock
        console.log('product')
        console.log(product)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            console.log(data.insertedId);
            callback(data.insertedId)
        })
    },
    getAllProductsAdmin: () => {


        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                resolve(products)
            }
            catch {
                reject(error)
            }
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ prodstatus: false }).toArray()
            resolve(products)
        })
    },
    getProductDetails: (prodId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            }).catch((response) => {
                reject(response)
            })
        })
    },

    updateProduct: (prodId, prodDetails) => {
        let stock = parseInt(prodDetails.stock)
        prodDetails.stock = stock
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(prodId) }, {
                $set: {
                    productname: prodDetails.productname,
                    price: prodDetails.price,
                    stock: prodDetails.stock,
                    brand: prodDetails.brand,
                    storage: prodDetails.storage,
                    image: prodDetails.image,
                    Description: prodDetails.Description


                }
            }).then((response) => {
                resolve()
            }).catch((response) => {
                reject(response)
            })
        })
    },

    productsView: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject(error)
            })
        })
    },
    catManagement: (data) => {
        console.log('categoryyyyyyyyyyyyyyyyyyyyy');
        console.log(data.Category);
        let response = {}
        return new Promise(async (resolve, reject) => {
            let catFind = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ Category: data.Category })
            if (catFind) {
                response.failed = true
                resolve(response)

            } else {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then(() => {
                    response.success = true
                    resolve(response)

                })
            }

        })

    },

    // getCategory:()=>{

    //    return new Promise(async(resolve,reject)=>{

    //     let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
    //     console.log('////----------/////////');
    //     console.log(categories);
    //     console.log('////----------/////////');
    //     resolve(categories)
    //    })
    // },


    brandManagement: (data) => {
        console.log('braaaaaaaaaaaaaaandddddddddddd');
        console.log(data);
        let response = {}
        return new Promise(async (resolve, reject) => {
            let brandFind = await db.get().collection(collection.BRAND_COLLECTION).findOne({ brandname: data.brandname })
            if (brandFind) {
                response.brandfailed = true
                resolve(response)

            } else {
                db.get().collection(collection.BRAND_COLLECTION).insertOne(data).then((response) => {

                    console.log('????????');
                    console.log(response.insertedId);
                    console.log('?????????')
                    response.id = response.insertedId
                    response.brandsuccess = true
                    resolve(response)

                })
            }

        })
    },

    getBrand: () => {
        return new Promise(async (resolve, reject) => {

            try {
                let brands = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
                resolve(brands)
            }
            catch {
                reject(error)
            }
        })
    },
    AddProdStatus: (ProdData) => {
        return new Promise(async (resolve, reject) => {
            unBlock = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ productname: ProdData.productname }, { $set: { prodstatus: false } })
            resolve()
        })
    },

    moveToWishlist: ({ prodId, user }) => {
        console.log("prodId:" + prodId, user)
        let wishlistObj = {
            product: ObjectId(prodId),
            user: ObjectId(user)
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                console.log(response)
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    },

    getWishlist: (userId) => {
        console.log('userId:' + userId)
        return new Promise(async (resolve, reject) => {
            try {
                let wishlistFind = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
                if (wishlistFind) {

                    let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                        {
                            $match: { user: ObjectId(userId) }
                        },

                        {
                            $lookup: {
                                from: collection.PRODUCT_COLLECTION,
                                localField: 'product',
                                foreignField: '_id',
                                as: 'product'
                            },
                        },
                        {
                            $project: {
                                item: 1, quantity: 1, user: 1, product: { $arrayElemAt: ['$product', 0] }
                            }
                        },

                    ]).toArray()
                    console.log('wishlist')
                    console.log(wishlist);
                    resolve(wishlist)
                } else {
                    let response = {}
                    response.wishlistNotFount = true
                    resolve(response)

                }

            }
            catch {
                reject(error)
            }

        })
    },

    incrementStock: ({ order, product, status, quantity }) => {
        let quantityParsed = parseInt(quantity)

        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(product) },
                {
                    $inc: {
                        stock: quantityParsed
                    }
                }).then((response) => {
                    resolve(response)
                }).catch((error) => {
                    reject(error)
                })

        })
    },
    getreturnProductDetails: (id) => {
        console.log('id:' + id)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(id) }).then((product) => {
                console.log('product:' + product);
                resolve(product)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    confirmCoupon: ({ couponCode }, userId, total) => {

        let d = new Date()
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear()

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        let time = [year, month, day].join('-')

        return new Promise(async (resolve, reject) => {
            let response = {}
            let couponFind = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: couponCode })
            if (couponFind) {

                console.log('coupon found')
                response.couponFind = true
                console.log('coupon')
                console.log(couponFind);

                if (time > couponFind.expiredate) {
                    console.log('coupon expired')
                    response.expired = true
                    resolve(response)
                }
                else {
                    response.expired = false
                    console.log('coupon not expired');

                    let couponAlreadyUsed = await db.get().collection(collection.COUPONALREADYUSED_COLLECTION).findOne({ couponId: ObjectId(couponFind._id), userId: ObjectId(userId) })
                    console.log('already:' + couponAlreadyUsed)
                    if (couponAlreadyUsed) {
                        console.log('already used');
                        response.alreadyUsed = true

                        resolve(response)
                    } else {
                        console.log('not used')
                        response.alreadyUsed = false
                        response.couponSuccess = 'coupon applied successfully'
                        let discount = couponFind.discount
                        let discountAmount = (discount / 100) * total
                        let totalPrice = total - discountAmount
                        response.totalPrice = totalPrice
                        response.discount = discountAmount

                        alreadyObj = {
                            userId: ObjectId(userId),
                            couponId: ObjectId(couponFind._id)
                        }
                        db.get().collection(collection.COUPONALREADYUSED_COLLECTION).insertOne(alreadyObj).then(() => {
                            db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ _id: ObjectId(userId) },
                                {
                                    $set: {
                                        couponId: couponFind._id
                                    }
                                }
                            )
                            resolve(response)
                        })

                    }
                }
            } else {
                console.log('coupon not found')
                response.couponFind = false
                resolve(response)
            }
        })
    },

    getCouponPrice: (userId, total) => {
        let totalAmount = total[0].grandTotal
        console.log(totalAmount, userId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        user: ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: collection.SIGNUP_COLLECTION,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
                {

                    $project: {
                        user: { $arrayElemAt: ['$userData', 0] },
                    }

                },
                {
                    $lookup: {
                        from: collection.COUPON_COLLECTION,
                        localField: 'user.couponId',
                        foreignField: '_id',
                        as: 'couponDetails'
                    }
                },
                {
                    $project: {
                        user: 1, couponDetails: { $arrayElemAt: ['$couponDetails', 0] }
                    }
                },

                {
                    $project: {
                        user: 1, couponDetails: 1, discountAmount: { $round: [{ $multiply: [{ $divide: ["$couponDetails.discount", 100] }, totalAmount] }, 0] }
                    }
                },
                {
                    $project: {
                        discountPrice: { $subtract: [totalAmount, "$discountAmount"] }, discountAmount: 1
                    }
                }
            ]).toArray().then((response) => {
                console.log(response)
                resolve(response)
            })
        })

    },

    removeCoupon: (userId) => {
        console.log(userId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SIGNUP_COLLECTION).findOne({ _id: ObjectId(userId) }).then((userData) => {
                console.log(userData)
                db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $unset: { couponId: userData.couponId } }).then(() => {
                    console.log('successfully deleted')
                    db.get().collection(collection.COUPONALREADYUSED_COLLECTION).deleteOne({ userId: ObjectId(userId), couponId: userData.couponId }).then(() => {
                        console.log('coupon deleted successfully')
                        resolve()
                    })
                })
            })
        })
    },
    deleteCoupon: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SIGNUP_COLLECTION).findOne({ _id: ObjectId(userId) }).then((userData) => {
                console.log(userData)
                db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $unset: { couponId: userData.couponId } }).then(() => {
                    console.log('successfully deleted')
                    resolve()
                })
            })
        })
    },

    filterProducts: (brandId) => {
        console.log(brandId.brandId)
        return new Promise((resolve,reject)=>{
            if (brandId.brandId instanceof Array ) {
                console.log('yes array')
                db.get().collection(collection.PRODUCT_COLLECTION).find({brand:{$in:brandId.brandId}}).toArray().then((response)=>{
                    console.log(response);
                    resolve(response)
                })
             }else{
               let data = Object.values(brandId)
               db.get().collection(collection.PRODUCT_COLLECTION).find({brand:{$in:data}}).toArray().then((response)=>{
                console.log(response);
                resolve(response)
            })
             }
        })
        
    },

    getProductsCount: () => {
        return new Promise(async (resolve, reject) => {
            count = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
            resolve(count)
        })
    },

    getPaginatedResult: (limit, startIndex) => {
        console.log('{{{{{{{{{{{{{{{{{');
        console.log(limit);
        console.log(startIndex);


        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(limit).skip(startIndex).toArray()
            resolve(products)
        })

    },

    findAddtoCartItems: (prodId, userId) => {
        let Obj = {}
        return new Promise(async (resolve, reject) => {
            console.log(prodId, userId)
            let response = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId), 'products.item': ObjectId(prodId) })
            console.log(response);
            if (response) {
                Obj.itemFound = true
                resolve(Obj)
            } else {
                Obj.itemFound = false
                resolve(Obj)
            }
        })
    },

    findProdForHome:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).find().limit(5).toArray().then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    }
}

