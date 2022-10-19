
function changeQuantity(itemId,prodId,user,count){
            

    let quantity=parseInt(document.getElementById(prodId).innerHTML)
    console.log(quantity)
    let productPrice =parseInt(document.getElementById(prodId+'prices').innerHTML)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            
            cart:itemId,
            product:prodId,
            count:count,
            quantity:quantity,
            user:user
            
        },
        method:'post',
        success:(Response)=>{

            console.log(Response)
             
           console.log(Response.response.minus)
            if(Response.response.ourOfStock){
                console.log("hi");
                
              
               if(Response.discountPrice){
                document.getElementById(prodId).innerHTML=quantity+count
                document.getElementById(prodId+'price').innerHTML =  document.getElementById(prodId).innerHTML * document.getElementById(prodId+'prices').innerHTML
                document.getElementById('discountTotal').innerHTML = Response.discountPrice
                document.getElementById('discount').innerHTML = Response.discount

                document.getElementById('subTotal').innerHTML=Response.total[0].grandTotal
                document.getElementById('grandtotal').innerHTML=Response.total[0].grandTotal
               
            }else{
                document.getElementById(prodId).innerHTML=quantity+count
                document.getElementById(prodId+'price').innerHTML =  document.getElementById(prodId).innerHTML * document.getElementById(prodId+'prices').innerHTML
               
                document.getElementById('subTotal').innerHTML=Response.total[0].grandTotal
                document.getElementById('grandtotal').innerHTML=Response.total[0].grandTotal
               
            }

               
            }else if(Response.response.minus){      
                console.log("inside");
                document.getElementById(prodId) .classList.add('disabled')
            }else{
                document.getElementById('plusButton').classList.add('disabled')
            }
            
        }
        
    })
}

function removeCartProducts(itemId,prodId){
    if(confirm('do you want to remove this product?')){
        $.ajax({
            url:'/remove-products',
            data:{
                cart:itemId,
                product:prodId,
            },
            method:'post',
            success:(Response)=>{
                location.reload()
            }
        })
    }
     
}



$("#form").submit((e)=>{
    console.log("haiiii")
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$("#form").serialize(),
        success:(response)=>{
            if(response.codSuccess){
                alert('cod')
                  location.href='/order-success'
            }else if(response.paypalsuccess){ 
                alert('paypal')
                  paypalPayment(response.orderId)   
            }else{
                alert('razor')
                razorpayPayment(response)
            }
           
        }
    })
})

function statusChange(orderId,prodId){
    let selectId=document.getElementById('inputGroupSelect04'+prodId).value
    $.ajax({
        url:'/admin/changeStatus',
        data:{
            order:orderId,
            product:prodId,
            status:selectId
        },
        method:'post',
        success:(Response)=>{
            if(Response.status){
                location.reload()
            }
           
        }
    })
    console.log(orderId,prodId,selectId);
}

function cancelOrder(orderId,prodId,quantity){
    console.log(orderId,prodId,quantity);
    let status = 'Cancelled'
    if(confirm('are you sure? do you want to return this products')){
        $.ajax({
            url:'/cancel-order',
            data:{
                order:orderId,
                product:prodId,
                status,
                quantity:quantity
            },
            method:'post',
            success:(Response)=>{
                if(Response.status){
                    alert('order cancelled!')
                    location.href = '/orders'
                }
               
            }
        })
    }
}

$("#addAddress").submit((e)=>{
    console.log("haiiii")
    e.preventDefault()
    $.ajax({
        url:'/add-address',
        type:'post',
        data:$("#addAddress").serialize(),
        success:(response)=>{
            if(response.status)
            location.reload()
        }
    })
})


function addressPass(name,address,mobile){
    console.log(name,address,mobile);
    $.ajax({
        url:'/confirmAddress',
        data:{
           name:name,
           address:address,
           mobile:mobile
        },
        type:'POST',
        success:()=>{
          location.href = '/proceed-to-checkout'
        }
    })
}

function deleteAddress(name,address){
    
    $.ajax({
        url:'/delete-address',
        data:{
            name:name,
            address:address
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                alert('are you sure, do you want to delete?')
                console.log('deletee');
                location.reload()
            }
          
        }
    })

}

function deleteBrand(brandId){
    alert(brandId)
     
    $.ajax({
        url:'/admin/delete-brand',
        data:{
           id:brandId
        },
        type:'POST',
        success:(response)=>{
            if(response.status){
                alert('are you sure, do you want to delete?')
                console.log('deletee');
                location.reload()
            }
        }
    })
}
// function orderDetails(orderId){
//     console.log('hellooooooo');
//     $.ajax({
//         url:'/allorders',
//         data:{
//             orderId:orderId
//         },
//         type:'POST',
//         success:(response)=>{
//             if(response.status){
//                 location.href = '/order-details'
//             }
//         }
//     })
// }

function razorpayPayment(order){
    console.log('hellloo');
var options = {
    "key": 'rzp_test_JK2eMcWr8sfXEU', // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in  currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "myPhone.com",
    "description": "online payment for your product",
    "image": "https://example.com/your_logo",
    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",

    "handler": function (response){
        console.log('helllllloooooooooo'+response,order);
        verifyPayment(response,order)
    },

    "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9999999999"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
   
};
var rzp1 = new Razorpay(options);
rzp1.open();
}
function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-razorpay-payment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                $.ajax({
                    url:'/verify-payment-again',
                    data:{
                        payment,
                        order
                    },
                    method:'post',
                    success:(response)=>{
                        if(response.success){
                            location.href='/order-success'
                        }else{
                            location.href='/order-failed'
                        }
                    }
                })
            }else{
                location.href = '/order-failed'
            }
        }
    })
}

function paypalPayment(order){
   alert(order)
    $.ajax({
        url:'/paypal-payment',
        data:{
            orderId:order
        },
        method:'post',
        success:(response)=>{
            // alert('paypal success')
            location.href=response
        }
    })
}

function moveToWishlist(prodId){
    console.log(prodId)
    $.ajax({
        url:'/add-to-wishlist',
        data:{
                prodId:prodId
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                swal({
                    title: "Good job!",
                    text: "Item added to the cart",
                    icon: "success",
                  });
            }
            
        }
    })
}


function addToCart(userId,prodId,wishlistId){
    $.ajax({
       url:'/add-to-cart-wishlist',
       data:{
           userId:userId,
           prodId:prodId,
           wishlistId:wishlistId
       },
       method:'post',
       success:(response)=>{
        if(response.success){
            swal("Good job!", "Item added to the cart!", "success");
            location.reload()
        }
       }
    })
}

function cancelWishlist(userId,prodId,wishlistId){
  
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {

            $.ajax({
                url:'/delete-wishlist',
                data:{
                    userId:userId,
                    prodId:prodId,
                    wishlistId:wishlistId
                },
                method:'post',
                success:(response)=>{
                 if(response.success){
                    swal("Item deleted successfully!", {
                        icon: "success",
                     });
                     location.reload()
                 }
                }
             })
        }else{

            swal("Your imaginary file is safe!");
        }
        
        })
    }


    $("#checkCoupon").submit((e)=>{
        console.log("coupon")
        e.preventDefault()
        $.ajax({
            url:'/confirm-coupon',
            type:'post',
            data:$("#checkCoupon").serialize(),
            success:(response)=>{
                console.log(response)
              if(response.couponFind){
                swal("Good job!", "You clicked the button!", "success");
                if(response.expired){
                    swal("oops!", "your coupon has been expired!", "warning")
                }else if(response.alreadyUsed){
                    swal("oops!", "this coupon has already used!, try another one", "warning");
                }else{
                    swal("Congrats!", "coupon added successfully!", "success");
                    location.reload()
                    document.getElementById('removeCouponBtn').innerHTML='REMOVE COUPON'
                }
                
              }else{
                swal("oops!", "invalid coupon!", "error");
              }
            }
        })
    })

    function removeBrandOffer(brandId){
        console.log(brandId)

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
    
                $.ajax({
                    
                    url:'/admin/delete-brand-offer',
                    type:'POST',
                    data:{
                       brandId:brandId
                    },
                    success:(response)=>{
                        if(response.success){
                            swal("Item deleted successfully!", {
                                icon: "success",
                             });
                             location.reload()
                        }
                    }

                 })
            }else{
    
                swal("Your offer is safe!");
            }
            
            })
    }


    $("#returnProduct").submit((e)=>{
        confirm('are you sure?')
        e.preventDefault()
        $.ajax({
            url:'/return-request',
            type:'post',
            data:$("#returnProduct").serialize(),
            success:(response)=>{
                if(response.status)
                alert(response.status)
                location.href = '/orders'
            }
        })
    })
    

    function approveReturn(orderId,prodId,returnId){
        console.log(orderId,prodId,returnId)

        swal({
            title: "Are you sure?",
            text: "Do you want to approve this return request",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
    
                $.ajax({
                    url:'/admin/approve-return',
                    data:{
                        orderId:orderId,
                        prodId:prodId,
                        returnId:returnId
                    },
                    method:'post',
                    success:(response)=>{
                     if(response.success){
                        swal("Request approved successfully!", {
                            icon: "success",
                         });
                         location.reload()
                        // alert('success')
                     }
                    }
                 })
            }else{
    
                swal("You haven't approved the return request");
            }
            
            })
        
    }
   
   
