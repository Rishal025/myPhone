var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { get, response, resource } = require('../app')
const { reject } = require('bcrypt/promises')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId



module.exports = {
    placeOrder: (order, products, total, coupon) => {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        var monthly = year + "/" + month

        newdate = year + "/" + month + "/" + day;

        var hours = dateObj.getHours();
        var minutes = dateObj.getMinutes();
        var seconds = dateObj.getSeconds();

        var time = hours + ":" + minutes

        console.log(time)

        return new Promise((resolve, reject) => {
            // let orderStatus='order confirmed'
            console.log(order, products, total, coupon);
            let status = order['paymentMethod'] === 'COD' ? 'placed' : 'pending';
            let paymentStatus = status === 'placed' ? 'Order confirmed' : 'Payment failed'
            let orderObj = {}
            if (coupon[0].discountPrice) {

                orderObj = {
                    deliveryDetails: {
                        name: order.fname,
                        mobile: order.phone,
                        address: order.streetAddress2,
                        street: order.streetAddress1,
                        pincode: order.pin,
                    },
                    userId: ObjectId(order.user),
                    paymentMethod: order['paymentMethod'],
                    products: products,

                    productLoop: products.forEach((Obj) => {
                        Obj.odrStatus = paymentStatus
                    }),
                    totalAmount: total[0].grandTotal,
                    discount: coupon[0].discountAmount,
                    total: coupon[0].discountPrice,
                    status: status,
                    date: newdate,
                    time: time,
                    month: monthly,
                    year: year
                }

            } else {
                orderObj = {
                    deliveryDetails: {
                        name: order.fname,
                        mobile: order.phone,
                        address: order.streetAddress2,
                        street: order.streetAddress1,
                        pincode: order.pin,
                    },
                    userId: ObjectId(order.user),
                    paymentMethod: order['paymentMethod'],
                    products: products,

                    productLoop: products.forEach((Obj) => {
                        Obj.odrStatus = paymentStatus
                    }),
                    totalAmount: total[0].grandTotal,
                    discount: 0,
                    total: coupon[0].discountAmount,
                    status: status,
                    date: newdate,
                    time: time,
                    month: monthly,
                    year: year
                }
            }
            let object = {}

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                object.orderId = response.insertedId
                console.log('insertedId:' + object.orderId);
                if (orderObj.paymentMethod === 'COD') {

                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.user) })
                    console.log(response)

                    db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: { _id: objectId(object.orderId) }
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

                        object.productData = productData
                        resolve(object)

                    })
                } else {
                    resolve(object)
                }





            }).catch(() => {
                reject()
            })
        })
    },

    getOrderAdmin: () => {
        return new Promise(async (resolve, reject) => {

            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        userId: 1,
                        status: 1,
                        orderStatus: '$products.odrStatus',
                        date: 1,
                        deliveryDetails: 1,
                        paymentMethod: 1,
                        totalAmount: 1


                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $lookup: {
                        from: collection.SIGNUP_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, status: 1, deliveryDetails: 1, product: { $arrayElemAt: ['$product', 0] }, orderStatus: 1, date: 1, userId: 1, paymentMethod: 1, userDetails: { $arrayElemAt: ['$userDetails', 0] }, totalAmount: 1
                    }
                },

                {
                    $addFields: {
                        convertPrice: { $toInt: '$product.price' },
                        // convertPrice: { $toInt:'$product.ProductPrice'},
                    }
                },
                {
                    $project: {


                        totalAmount: { $multiply: ['$quantity', '$convertPrice'] }, status: 1, quantity: 1, product: 1, paymentMethod: 1, date: 1, orderStatus: 1, userId: 1, userDetails: 1, deliveryDetails: 1
                    }
                }

            ]).toArray()
            console.log('rrrrrrrrrrrrrrrrr');
            console.log(result);
            console.log('rrrrrrrrrrrr');

            resolve(result)
        })
    },

    getCartProductsList: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log('cart');
            console.log(cart);
            resolve(cart.products)
        })
    },

    getOrders: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let items = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).sort({ _id: -1 }).toArray()
                if (items[0]) {
                    response.failed = false
                    console.log('iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii')
                    console.log(items);
                    resolve(items)
                } else {
                    console.log('elseeeeeeeeeeee')
                    response.failed = true
                    resolve(response)
                }
            }
            catch {
                reject(error)
            }


        })
    },

    getAllOrders: (orderId) => {
        console.log('orderId:' + orderId);
        return new Promise(async (resolve, reject) => {
            try {

                let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                    {
                        $match: { _id: ObjectId(orderId) }
                    },

                    {
                        $unwind: '$products'
                    },

                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity',
                            orderStatus: '$products.odrStatus',
                            userId: 1,
                            status: 1,
                            deliveryDetails: 1,


                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, status: 1, orderStatus: 1, product: { $arrayElemAt: ['$product', 0] }, deliveryDetails: 1
                        }
                    },

                    {
                        $addFields: {
                            convertPrice: { $toInt: '$product.price' },
                            // convertPrice: { $toInt:'$product.ProductPrice'},
                        }
                    },
                    {
                        $project: {


                            totalAmount: { $multiply: ['$quantity', '$convertPrice'] }, status: 1, quantity: 1, product: 1, date: 1, orderStatus: 1, deliveryDetails: 1
                        }
                    }

                ]).toArray()

                resolve(result)
            }
            catch {
                reject(error)
            }


        })

    },
    orderDetails: (id) => {

        console.log(id);
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: ObjectId(id) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $unwind: '$deliveryDetails'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity',
                            userId: 1,
                            status: 1,
                            deliveryDetails: 1,
                            orderStatus: '$products.odrStatus',
                            totalAmount: 1

                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, status: 1, product: { $arrayElemAt: ['$product', 0] }, deliveryDetails: 1, orderStatus: 1, totalAmount: 1
                        }
                    },

                    {
                        $addFields: {
                            convertPrice: { $toInt: '$product.price' },
                            // convertPrice: { $toInt:'$product.ProductPrice'},
                        }
                    },
                    {
                        $project: {


                            totalAmount: { $multiply: ['$quantity', '$convertPrice'] }, status: 1, quantity: 1, product: 1, date: 1, deliveryDetails: 1, orderStatus: 1
                        }
                    }

                ]).toArray()
                console.log(result)
                resolve(result)
            }
            catch {
                reject()
            }

        })
    },

    findAddress: (orderId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) }).then((details) => {
                let billing = {}
                billing.address = details.deliveryDetails
                billing.total = details.totalAmount
                resolve(billing)
            }).catch((e) => [
                reject(e)
            ])
        })

    },


    changeStatus: ({ order, product, status }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(order), "products": { $elemMatch: { 'item': ObjectId(product) } } },
                {
                    $set: {
                        'products.$.odrStatus': status
                    }
                }
            ).then((response) => {
                console.log('-------' + response);
                resolve()
            }).catch((response) => {
                reject(response)
            })

        })
    },

    cancelOrder: ({ order, product, status, quantity }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(order), "products": { $elemMatch: { 'item': ObjectId(product) } } },
                {
                    $set: {
                        'products.$.odrStatus': status
                    }
                }
            ).then((response) => {
                console.log('-------' + response);
                resolve(response)

            }).catch((error) => {
                reject(error)
            })

        })
    },

    getAllOrdersAdmin: () => {

        return new Promise(async (resolve, reject) => {
            try {
                let items = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ _id: -1 }).toArray()
                console.log(items)
                resolve(items)
            }
            catch {
                reject(error)
            }
        })
    },

}