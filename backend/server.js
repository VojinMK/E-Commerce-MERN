const app =require('./app');
const connectDatabase=require('./config/database')

const dotenv=require('dotenv');
const cloudinary=require('cloudinary')

//hvatanje neuhvacenih izuzetaka, npr nesto napisem ovde, mora da bude na vrhu da bi radilo kako treba
process.on('uncaughtException',err=>{
    console.log(`ERROR: ${err.stack}`)
    console.log('Shutting down server due to uncaught exception')

    process.exit(1)
})

//podesavanje config fajla
dotenv.config({path: 'backend/config/config.env'})

//konektovanje sa bazom
connectDatabase();

//setovanje cloudinary kofiguracije

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const server=app.listen(process.env.PORT, ()=> {
    console.log(`Server started on PORT: ${process.env.PORT}, in ${process.env.NODE_ENV} mode.`)
})

//hendlovanje neuhavcenih promis izuzetaka, primer string mongo konekcije
process.on('unhandledRejection',err=>{
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down the server due to Unhandled Promise rejection');
    server.close(()=>{
        process.exit(1)
    })
})