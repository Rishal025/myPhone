var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { get, response } = require('../app')
const { reject } = require('bcrypt/promises')
const { ObjectID, ObjectId } = require('bson')
var objectId = require('mongodb').ObjectId


module.exports = {

    getSamsung: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: '634e73d0d3c54acec73ea5d4' }).toArray()
                resolve(result)
            }
            catch {
                reject()
            }

        })
    },

    getOneplus: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: "634e745fd3c54acec73ea5d9" }).toArray()
                resolve(result)
            }
            catch {
                reject()
            }

        })
    },

    getApple: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand: "634e73f5d3c54acec73ea5d5"}).toArray()
                resolve(result)
            }
            catch {
                reject()
            }
        })
    },

    getAllBrands: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            }).catch((response) => {
                reject(response)
            })
        })
    },

    deleteBrand: ({ id }) => {
        console.log(id)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: ObjectId(id) }).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    findBrand: (id) => {
        console.log('iddddddd');
        console.log(id);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: ObjectId(id) }).then((result) => {
                console.log(result);
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    updateBrand: (data) => {
        console.log(data);
        let response = {}
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(data.id) }, {
                $set: {
                    brandname: data.brandname,
                    status: data.status,
                    img: data.img
                }
            })
            response.success = true
            resolve(response)
        })
    },

    findAllBrand: (bId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: bId }).toArray().then((response) => {
                console.log(response)
                resolve(response)
            }).catch((error) => {
                console.log(error)
            })
        })
    }
}