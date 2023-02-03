let express = require("express");
let app = express();
app.use(express.json());
app.use(function(req,res,next){
res.header("Access-Control-Allow-Origin","*");
res.header("Access-Control-Allow-Methods",
"GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD");
res.header("Access-Control-Allow-Headers",
"Origin,X-Requested-With,Content-Type,Accept");
next();
});
let port = process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app listening on port ${port}!`));

let { data } = require("./shopData.js");

let fs = require("fs");
let fname = "shop.json";

app.get("/resetData",function(req,res){
 let fdata = JSON.stringify(data);
 //console.log(fdata)
fs.writeFile(fname,fdata,function(err){
  if(err) res.status(404).send(err);
  else res.send("Data is Successfully Reseted!");
 })
});
app.get("/shops",function(req,res){
  fs.readFile(fname,"utf-8",function(err,results){
    if(err) res.status(404).send(err);
    else{
        let fData = JSON.parse(results);
        res.send(fData.shops);
    }
  })
});
app.post("/shops",function(req,res){
 let body = req.body;
 fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else{
     let fData = JSON.parse(result);
     let maxid = fData.shops.reduce((acc,curr)=>curr.shopId>acc?curr.shopId:acc,0);
     let newid = maxid+1;
     let newShop = {shopId:newid,...body};
     fData.shops.push(newShop);
     let data1 = JSON.stringify(fData);
     fs.writeFile(fname,data1,function(err1){
        if(err1) res.status(404).send(err1);
        else res.send(newShop);
     })
    }
 })
})
app.get("/products",function(req,res){
 fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else{
        let fData = JSON.parse(result);
        res.send(fData.products);
    }
 })
});
app.get("/products/:productId",function(req,res){
    let id = +req.params.productId;
    fs.readFile(fname,"utf-8",function(err,result){
       if(err) res.status(404).send(err);
       else{
           let fData = JSON.parse(result);
           let prod = fData.products.find((p1)=>p1.productId==id);
           if(prod)
           res.send(prod);
           else 
           res.status(404).send("No product found!");
       }
    })
   });
app.post("/products",function(req,res){
 let body = req.body;
 fs.readFile(fname,"utf8",function(err,result){
    if(err) res.status(404).send(err);
    else{
      let fData = JSON.parse(result);
      let maxid = fData.products.reduce((acc,curr)=>curr.productId>acc?curr.productId:acc,0);
      let newid = maxid + 1;
      let newProduct = {productId:newid,...body};
      fData.products.push(newProduct);
      let data1 = JSON.stringify(fData);
      fs.writeFile(fname,data1,function(err1){
        if(err1) res.status(404).send(err1);
        else res.send(newProduct);
      })
    }
 })
});
app.put("/products/:productId",function(req,res){
 let body = req.body;
 let id = +req.params.productId;
 fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else{
     let fData = JSON.parse(result);
     let index = fData.products.findIndex((d1)=>d1.productId==id);
     if(index>=0){
       let updatePro = {...fData.products[index],...body};
       fData.products[index] = updatePro;
       let data1 = JSON.stringify(fData);
       fs.writeFile(fname,data1,function(err1){
        if(err1) res.status(404).send(err1);
        else res.send(updatePro);
       })
     }
     else res.status(404).send("No product found!");
    }
 })
})
app.get("/purchases",function(req,res){
 let shop = req.query.shop;
 let product = req.query.product;
 let sort = req.query.sort;
 fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else{
      let arr1 = JSON.parse(result).purchases;
     if(shop)
       arr1 = arr1.filter(p1=>p1.shopId==shop);
     if(product)
        arr1 = arr1.filter(p1=>product.split(",").find((pr)=>pr==p1.productid));
     if(sort=="QtyAsc")
        arr1.sort((a1,a2)=>+a1.quantity-(+a2.quantity));
     if(sort=="QtyDesc")
       arr1.sort((a1,a2)=>+a2.quantity-(+a1.quantity));
     if(sort=="ValueAsc")
       arr1.sort((a1,a2)=>(+a1.price*(+a1.quantity))-(+a2.price*(+a2.quantity)));
     if(sort=="ValueDesc")
       arr1.sort((a1,a2)=>(+a2.price*(+a2.quantity))-(+a1.price*(+a1.quantity)));
  res.send(arr1);
    }
 });
})
app.post("/purchases",function(req,res){
 let body = req.body;
 fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else{
     let fData = JSON.parse(result);
     let maxid = fData.purchases.reduce((acc,curr)=>curr.purchaseId>acc?curr.purchaseId:acc,0);
     let newid = maxid + 1;
     let newpur = {purchaseId:newid,...body};
     fData.purchases.push(newpur);
     let data1 = JSON.stringify(fData);
     fs.writeFile(fname,data1,function(err1){
        if(err1) res.status(404).send(err1);
        else res.send(newpur);
     })
    }
 })
})
app.get("/purchases/shops/:shopId",function(req,res){
 let id = +req.params.shopId;
 fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else{
      let fData = JSON.parse(result);
      let purch = fData.purchases.filter((p1)=>p1.shopId==id);
      res.send(purch)
    }
 })
})
app.get("/purchases/products/:productId",function(req,res){
 let id = +req.params.productId;
 fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else {
        let fData = JSON.parse(result);
        let purch = fData.purchases.filter((p1)=>p1.productid==id);
        res.send(purch);
    }
 })
});
app.get("/totalPurchase/shop/:shopId",function(req,res){
  let id = +req.params.shopId;
  fs.readFile(fname,"utf-8",function(err,result){
    if(err) res.status(404).send(err);
    else{
      let fData = JSON.parse(result);
        let purch = fData.purchases.filter((p1)=>p1.shopId==id);

    let total = fData.products.map((p1)=>{
        let tot =  purch.reduce((acc,curr)=>p1.productId===curr.productid?acc+(+curr.price*(+curr.quantity)):acc,0);
      return({"id":p1.productId,"total":tot} )});
      let filTot = total.filter((f1)=>f1.total!=0);
       res.send(filTot);
    }
  })
})
app.get("/totalPurchase/product/:productId",function(req,res){
    let id = +req.params.productId;
    fs.readFile(fname,"utf-8",function(err,result){
      if(err) res.status(404).send(err);
      else{
        let fData = JSON.parse(result);
          let purch = fData.purchases.filter((p1)=>p1.productid==id);
      let total = fData.shops.map((p1)=>{
     let tot =  purch.reduce((acc,curr)=>p1.shopId===curr.shopId?acc+(+curr.price*(+curr.quantity)):acc,0);
        return({"id":p1.shopId,"total":tot} )});
        let filTot = total.filter((f1)=>f1.total!=0);
        res.send(filTot);
      }
    })
  })
