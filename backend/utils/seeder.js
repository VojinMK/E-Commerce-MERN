const Product=require('../models/product')
const dotenv=require('dotenv')
const connectDatabase=require('../config/database');

const products=require('../data/products')

//podesavanje config fajla
dotenv.config({path: 'backend/config/config.env'})

connectDatabase();

const seedProducts=async()=>{
    try{
        //prvo brisemo sve, pa dodajemo sve iz fajla products
        await Product.deleteMany();
        console.log('Products are deleted');
         
        await Product.insertMany(products);
        console.log('All products are added.')
        
        process.exit();

    }catch(error){
        console.log(error.message);
        process.exit();
    }
}
seedProducts();