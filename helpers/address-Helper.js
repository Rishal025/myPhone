var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { get, response } = require('../app')
const { reject } = require('bcrypt/promises')
var objectId = require('mongodb').ObjectId


module.exports = {

    addAddress: (addData) => {

        return new Promise(async (resolve, reject) => {

            let address = {}
            let Obj = {
                name: addData.name,
                mobile: addData.phone,
                email: addData.email,
                address: addData.streetAddress2,
                street: addData.streetAddress1,
                town: addData.town,
                state: addData.state,
                country: addData.country,
                pincode: addData.pin
            }

            address.userAddress = Obj
            address.userId = addData.user,



                db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address).then(() => {
                    resolve()
                }).catch(() => {
                    reject()
                })
        })
    },

    findAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ userId: userId })
                if (address) {
                    console.log('ifffffffffffffffffffff')
                    db.get().collection(collection.ADDRESS_COLLECTION).aggregate([
                        {
                            $match: { userId: userId }
                        },
                        {
                            $group: { _id: "$userAddress" }
                        }
                    ]).toArray().then((result) => {
                        resolve(result)
                    })


                } else {
                    let response = ""
                    resolve(response)
                }
            }
            catch {
                reject(error)
            }
        })
    },

    selectAddress: ({ name, address, mobile }) => {
        let userName = name
        let userAddress = address

        return new Promise(async (resolve, reject) => {
            try {
                let addFind = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ $and: [{ 'userAddress.name': userName }, { 'userAddress.address': userAddress }] })
                resolve(addFind)
            }
            catch {
                reject(error)
            }

        })
    },

    editFillAddress: (address) => {
        return new Promise(async (resolve, reject) => {
            try {
                let useraddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ 'userAddress.address': address })
                resolve(useraddress)
            }
            catch {
                reject(error)
            }

        })
    },

    updateAddress: (address) => {
        console.log('adddddddddddddddddd');
        console.log(address);
        console.log('ddddddddddddddddddd');
        return new Promise(async (resolve, reject) => {
            try {
                let find = await db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ 'userAddress.address': address.streetAddress2 }
                    , {
                        $set: {
                            'userAddress.name': address.name,
                            'userAddress.mobile': address.phone,
                            'userAddress.address': address.streetAddress2,
                            'userAddress.street': address.streetAddress1,
                            'userAddress.town': address.town,
                            'userAddress.state': address.state,
                            'userAddress.country': address.country,
                            'userAddress.pincode': address.pin,
                        }
                    })
                resolve()
            }
            catch {
                reject()
            }

        })

    },

    deleteAddress: ({ name, address }) => {
        console.log('yuoioioi')
        console.log(name, address)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ 'userAddress.name': name }).then(() => {
                console.log('yuoioioi')
                resolve()
            }).catch(() => {
                reject()
            })

        })
    }
}