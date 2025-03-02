const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
const bodyparser=require('body-parser')
const fileUpload=require('express-fileupload')
const dotenv=require('dotenv');

const errorMiddleware=require('./middlewares/errors.js')
app.use(bodyparser.json({ limit: '10mb' }));
app.use(bodyparser.urlencoded({ extended: true, limit: '10mb' }));

//podesavanje config fajla
dotenv.config({path: 'backend/config/config.env'})

app.use(express.json());
app.use(bodyparser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(fileUpload());



//import svih ruta
const products=require('./routes/product');
const auth=require('./routes/auth')
const payment=require('./routes/payment')
const order=require('./routes/order')

app.use('/api/v1',products);
app.use('/api/v1',auth);
app.use('/api/v1',payment);
app.use('/api/v1',order);


// middleware za rad sa greskama
app.use(errorMiddleware);

module.exports=app;