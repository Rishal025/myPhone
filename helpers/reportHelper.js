var db=require('../config/connection')
var collection=require('../config/collection');
const { reject } = require('bcrypt/promises');
const { ObjectId } = require('mongodb');
var objectId=require('mongodb').ObjectId

module.exports={
getSalesReportByDate:()=>{
  
    return new Promise(async(resolve,reject)=>{
        let datas = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $unwind:'$products'
            },
            // {
               
            //    $match:{
            //     'products.odrStatus':{$nin:['Cancelled']
            //    }
            // }

            // },
            // {$group:
            //     {_id:'$date',
            //     total:
            //       {
            //         $sum:'$totalAmount'
            //       }
            //     }
            // }
        ]).toArray()

        console.log('aggreagate:'+datas)
        resolve(datas)
    })
},
}