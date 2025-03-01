const mongoose=require('mongoose');

//uspostavljanje konekcije sa bazom podataka
const connectDatabase=()=>{
   mongoose.connect(process.env.DB_LOCAL_URI,{
     useNewUrlParser: true,
     useUnifiedTopology: true,

   }).then(con=> {
    console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
   })
}

module.exports=connectDatabase;