let express= require('express');
let app= express();
let port = 7700;
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let mongoUrl="mongodb+srv://test:iOOoxoWbkV0up8vE@cluster0.elbrrf2.mongodb.net/?retryWrites=true&w=majority";
let cors = require('cors');
let bodyParser = require('body-parser');

let db;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get('/',(req,res)=>{
   res.send(`welcome to port ${port}`);
})



//product categories

app.get('/category',(req,res)=>{
    db.collection('category').find().toArray((err,data)=>{
        if(err) throw err
        res.send(data)
    })
})


//products based on category
app.get('/catProd/:catId',(req,res)=>{
  let catId= Number(req.params.catId)
  let query= {category_id:catId}
    db.collection('subCategory').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })

})


//products based on subCategory and brand filter and color
app.get('/subCat/:subCatId',(req,res)=>{
    let subCatId = Number(req.params.subCatId);
    let query = {subCat_id:subCatId};
    let brand = req.query.brand;
    let Company = brand;
    let colors = req.query.colors;
    
    if(Company || colors){
        if(Company && colors){
        query={subCat_id:subCatId,company:Company,color:colors}}
        else if(Company){
            query={subCat_id:subCatId,company:Company}
        }
        else if(colors){
            query={subCat_id:subCatId,color:colors}}
        }
    else{
        query={subCat_id:subCatId};
    }

    db.collection('products').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})


//product details
app.get('/product/:proId',(req,res)=>{
    let proId=Number(req.params.proId);
    let query = {product_id:proId};
  

    db.collection('products').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})

//all products
app.get('/allProducts',(req,res)=>{
    db.collection('products').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})

//products based on brands
app.get('/brand/:brands',(req,res)=>{
    db.collection('products').find({company:req.params.brands}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})


//cart details
app.post('/cartDetails',(req,res)=>{
    if(Array.isArray(req.body.id)){
        db.collection('products').find({product_id:{$in:req.body.id}}).toArray((err,result)=>{
            if(err) throw err;
            res.send(result)
        })
    }
    else{
        res.send("product not found")
    }
})


//place order
app.post('/placeOrder',(req,res)=>{
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send("order added")
    })
})

// order details

app.get('/orderDetails/:email',(req,res)=>{
    
    let email=req.params.email;
    db.collection('orders').find({email:email}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })

})

//update orders
app.put('/updateOrder/:oid',(req,res)=>{
    let oid = Number(req.params.oid);
    db.collection('orders').updateOne(
        {order_id:oid},
        {
            $set:{
                "status":req.body.status,
                "bank_name":req.body.bank_name,
                "date":req.body.date
            }
        },
        (err,result)=>{
            if(err) throw err
            res.send("Your Order is Updated")
        }
          
    )
})



//delete order
app.delete('/deleteOrder/:oid',(req,res)=>{
    let oid = Number(req.params.oid);
    db.collection('orders').remove(
        {order_id:oid},(err,result)=>{
            if(err) throw err
            res.send("order removed")
        }
    )
})



//all orders
app.get('/orders',(req,res)=>{
    db.collection('orders').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})




//mongo connection

MongoClient.connect(mongoUrl,(err,connection)=>{
    if(err) console.log("problem while connecting");
    db = connection.db('WinKart');
    app.listen(port,()=>{
        console.log(`connection established on port ${port}`);
    })
})