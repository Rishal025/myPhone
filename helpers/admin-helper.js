var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { reject } = require('bcrypt/promises')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId


module.exports = {
    getAllUsers: () => {
        console.log('hiiiiiiiiiiiiiiiiiiiiiiiii');
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.get().collection(collection.SIGNUP_COLLECTION).find().toArray()
                resolve(users)
            }
            catch {
                reject(error)
            }
        })
    },
    blockUser: (objId) => {
        let response = {}
        id = objectId(objId)
        console.log(id)
        return new Promise(async (resolve, reject) => {
            try {
                block = await db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ _id: id }, { $set: { signupstatus: false } })
                response.block = true
                resolve(response)
            }
            catch {
                reject(error)
            }

        })
    },
    unBlockUser: (objId) => {
        let response = {}
        id = objectId(objId)
        console.log(id)
        return new Promise(async (resolve, reject) => {
            try {
                unBlock = await db.get().collection(collection.SIGNUP_COLLECTION).updateOne({ _id: id }, { $set: { signupstatus: true } })
                response.unblock = true
                resolve(response)
            }
            catch {
                reject(error)
            }

        })
    },


    softDelProd: (prodId) => {
        let response = {}
        id = objectId(prodId)
        console.log(id)
        return new Promise(async (resolve, reject) => {
            try {
                soft = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: id }, { $set: { prodstatus: true } })
                response.soft = true
                resolve(response)
            }
            catch {
                reject(error)
            }

        })
    },

    undoProd: (prodId) => {
        let response = {}
        id = objectId(prodId)
        console.log(id)
        return new Promise(async (resolve, reject) => {
            try {
                soft = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: id }, { $set: { prodstatus: false } })
                response.soft = false
                resolve(response)
            }
            catch {
                reject(error)
            }

        })
    },

    getSalesReportByWeek: () => {

        return new Promise(async (resolve, reject) => {
            let datas = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {

                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }

                },
                {
                    $group:
                    {
                        _id: '$date',
                        total:
                        {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ]).toArray()

            console.log('aggreagate:' + datas)
            resolve(datas)
        })
    },

    getSalesReportByMonth: () => {

        return new Promise(async (resolve, reject) => {
            let datas = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {

                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }

                },
                {
                    $group:
                    {
                        _id: '$month',
                        total:
                        {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ]).toArray()
            console.log('monthly')
            console.log(datas)
            resolve(datas)
        })
    },

    getSalesReportByYear: () => {

        return new Promise(async (resolve, reject) => {
            let datas = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {

                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }

                },
                {
                    $group:
                    {
                        _id: '$year',
                        total:
                        {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ]).toArray()

            resolve(datas)
        })
    },

    addCoupon: (couponData) => {
        return new Promise((resolve, reject) => {
            let discount = parseInt(couponData.discount)
            couponData.discount = discount
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then(() => {
                resolve();
            }).catch((response) => {
                reject(response)
            })
        })
    },

    getCoupon: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((response) => {
                console.log(response)
                resolve(response)
            }).catch((response) => {
                reject(response)
            })
        })
    },

    deleteCoupon: ({ cId }) => {
        console.log('cId:' + cId)

        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: ObjectId(cId) }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })

        })
    },

    weeklyTotal: () => {

        return new Promise(async (resolve, reject) => {
            let datas = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {

                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }

                },
                {
                    $group:
                    {
                        _id: '$year',
                        total:
                        {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: '$total'
                        }
                    }
                }

            ]).toArray()
            console.log(datas)
            resolve(datas)

        })

    },

    monthlyTotal: () => {
        return new Promise(async (resolve, reject) => {
            let datas = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {

                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }

                },
                {
                    $group:
                    {
                        _id: '$month',
                        total:
                        {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: '$total'
                        }
                    }
                }
            ]).toArray()
            resolve(datas)
        })
    },

    yearlyTotal: () => {

        return new Promise(async (resolve, reject) => {
            let datas = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {

                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }

                },
                {
                    $group:
                    {
                        _id: '$year',
                        total:
                        {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: '$total'
                        }
                    }
                }
            ]).toArray()

            resolve(datas)
        })
    },

    codSales: () => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: 'COD',
                        status: 'placed'
                    }
                },

                {
                    $unwind: '$products'
                },
                {
                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }
                },
                //    {
                //     $group:{
                //         '_id': {payment:'$paymentMethod',Object:'$_id'}
                //     }
                //    },

                {
                    $group: {
                        '_id': null,
                        count: { $sum: 1 }
                    }
                }

            ]).toArray()

            resolve(result)
        })
    },

    razorSales: () => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: 'Razorpay',
                        status: 'placed'
                    }
                },

                {
                    $unwind: '$products'
                },
                {
                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }
                },
                //    {
                //     $group:{
                //         '_id': {payment:'$paymentMethod',Object:'$_id'}
                //     }
                //    },

                {
                    $group: {
                        '_id': null,
                        count: { $sum: 1 }
                    }
                }

            ]).toArray()

            resolve(result)
        })
    },

    paypalSales: () => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: 'Paypal',
                        status: 'placed'
                    }
                },

                {
                    $unwind: '$products'
                },
                {
                    $match: {
                        'products.odrStatus': {
                            $nin: ['Cancelled']
                        }
                    }
                },
                //    {
                //     $group:{
                //         '_id': {payment:'$paymentMethod',Object:'$_id'}
                //     }
                //    },

                {
                    $group: {
                        '_id': null,
                        count: { $sum: 1 }
                    }
                }

            ]).toArray()

            resolve(result)
        })
    },

    addBrandOffer: (data) => {
        console.log(data)
        return new Promise(async (resolve, reject) => {

            let brand = await db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(data.brand) },
                {
                    $set: {

                        offer: true,
                        discount: data.discount,
                        expireDate: data.expiredate

                    }
                })

            resolve(data.brand)
        })
    },

    findProducts: (brandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: brandId }).toArray().then((products) => {
                resolve(products)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    brandOfferCalc: ({ brand, discount, expiredate }, product) => {

        let offerPercentage = parseInt(discount)
        discount = offerPercentage
        let ProductPrice = parseInt(product.price)
        product.price = ProductPrice

        offer = (discount / 100) * product.price
        let offerPrice = Math.trunc( offer )
        totalPrice = product.price - offerPrice

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: product._id, brand: brand },
                {
                    $set: {
                        discountPercentage: discount,
                        brandDiscount: offerPrice,
                        price: totalPrice,
                        originalPrice: product.price
                    }
                }
            ).then(() => {
                resolve()
            })
        })

    },


    findBrand: (brandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: ObjectId(brandId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getBrandOffer: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).find({ offer: true }).toArray().then((response) => {
                resolve(response)
            })
        })
    },

    deleteBrandOffer: ({ brandId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(brandId) },
                {
                    $unset: {
                        offer: true
                    }
                }).then(() => {
                    resolve(brandId)

                }).catch(() => {
                    reject()
                })
        })
    },

    findProductForBrandOfferRemove: (brandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: brandId }).toArray().then((products) => {
                resolve(products)
            }).catch((error) => {
                reject(error)
            })
        })

    },

    removeBrandOffer: (products) => {
        let product = products[0]
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ brand: product.brand },
                {
                    $unset: {
                        discountPercentage: product.discountPercentage,
                        brandDiscount: product.brandDiscount,
                        price: product.price
                        // originalPrice:product.price
                    }
                }).then((response) => {
                    console.log(response);
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ brand: product.brand },
                        {
                            $rename: {
                                'originalPrice': 'price'
                            }
                        }).then(() => {
                            resolve()
                        })
                })
            db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: product.brand }).toArray().then((response) => {

                console.log('response');
                console.log(response);
                resolve()
            })
        })
    },

    returnRequest: (data) => {
        console.log(data);

        let d = new Date()
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear()

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        let time = [year, month, day].join('-')

        return new Promise((resolve, reject) => {
            returnData = {
                reason: data.reason,
                description: data.description,
                orderId: ObjectId(data.orderId),
                prodId: ObjectId(data.prodId),
                date: time,
                status: data.status


            }
            db.get().collection(collection.RETURN_COLLECTION).insertOne(returnData).then(() => {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(data.orderId), "products": { $elemMatch: { 'item': ObjectId(data.prodId) } } },
                    {
                        $set: {
                            'products.$.odrStatus': 'Request pending'
                        }
                    }
                ).then((response) => {
                    console.log('status changed');
                    resolve()
                }).catch((e) => {
                    reject(e)
                })
            }).catch((error) => {
                reject(error)
            })
        })
    },

    getReturnRequests: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let returnOrder = await db.get().collection(collection.RETURN_COLLECTION).aggregate([
                    {
                        $lookup: {
                            from: collection.ORDER_COLLECTION,
                            localField: 'orderId',
                            foreignField: '_id',
                            as: 'order'
                        }
                    },
                    {
                        $project: {
                            reason: 1,
                            status: 1,
                            description: 1,
                            orders: { $arrayElemAt: ['$order', 0] }
                        }
                    },
                    {
                        $project: {
                            reason: 1,
                            status: 1,
                            description: 1,
                            orders: 1
                        }
                    },

                    {
                        $unwind: '$orders.products'
                    },

                    {
                        $match: {
                            'orders.products.odrStatus': {
                                $in: ['Request pending', 'Request approved']
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'orders.products.item',
                            foreignField: '_id',
                            as: 'returnProducts'
                        }
                    },
                    {
                        $unwind: '$returnProducts'
                    }

                ]).toArray()
                resolve(returnOrder)
            }
            catch {
                reject(error)
            }

        })

    },

    approveReturn: ({ orderId, prodId, returnId }) => {
        console.log(orderId, prodId, returnId)

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId), "products": { $elemMatch: { 'item': ObjectId(prodId) } } },
                {
                    $set: {
                        'products.$.odrStatus': 'Request approved'
                    }
                }).then(() => {
                    db.get().collection(collection.RETURN_COLLECTION).updateOne({ _id: ObjectId(returnId) },
                        {
                            $set: {
                                status: 'Request approved'
                            }
                        }
                    ).then(() => {
                        console.log('status changed');
                        resolve()
                    }).catch(() => {
                        reject()
                    })

                })
        })
    }


}