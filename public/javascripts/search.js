

function sendData(e){
                
    const searchData = document.getElementById('searchView')
    let match = e.value.match(/^[a-zA-z0-9 ]*/);
    let match2 = e.value.match(/[ ]*/);
    if(match2[0] === e.value){
        searchData.innerHTML = '';
        return;
    }
    if(match[0] === e.value){
        fetch('searchResult',{
            method:'POST',
            headers: {'content-Type': 'application/JSON'},
            body: JSON.stringify({payload: e.value})
        }).then(res => res.json()).then(data =>{
            let payload = data.payload
            console.log(payload)
            searchData.innerHTML = '';
            if(payload.length < 1){
                searchData.innerHTML = '<p>Sorry..Nothing found</p>';
                return;
            }
    
            payload.forEach((item,index)=>{
                if(index > 0) searchData.innerHTML += '<hr>';
                searchData.style.display ='block'
                searchData.innerHTML += `<a href="/product-view/${item._id}"><img src="/images/product/${item.img[0]}" alt="" style="width:50px; height:50px;"><p>${item.productname}</p></a>`
            })
         
        })
        return;
    
    }
    searchData.innerHTML = '';
}