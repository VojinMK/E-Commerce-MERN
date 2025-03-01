const ErrorHandler=require('../utils/errorHandler');

module.exports=(err,req,res,next)=>{
    //500 greska na serveru, ako ovaj statusCode ne postoji
    err.statusCode=err.statusCode || 500;
   //razdvajanje prikaza errora u razlicitim modovima
    if(process.env.NODE_ENV==='DEVELOPMENT'){
       res.status(err.statusCode).json({
        success:false,
        error:err,
        errMessage:err.message,
        stack: err.stack
       })
    }
    if(process.env.NODE_ENV==='PRODUCTION'){
        //kreiranje kopije erora
        let error ={...err}

        error.message=err.message

        //pogresan mongoose object id eror, npr odemo u postaman i kusamo neki djqodjqw id, i on treba da izbaci lepu poruku
        if(err.name==='CastError'){
            const message=`Resource not found. Invalid: ${err.path}`
            error=new ErrorHandler(message,400)
        }

        //hendlovanje Mongoose validacijom, npr kad nam fale dva polja koju su required, da prikaze da sve to nedostaje, a ne samo prvi
        if(err.name==='ValidationError'){
            const message=Object.values(err.errors).map(value=>value.message)
            error=new ErrorHandler(message,400)
        }
        
        //hendlovanje mongoose greskama zbog duplikatima(npr email itd)
        if(err.code===11000){
            const message=`Duplicate ${Object.keys(err.keyValue)} entered`
            error=new ErrorHandler(message,400)
        }

        //hendlovanje greskom zbog pogresnog jwt tokena
        if(err.name==='JsonWebTokenError'){
            const message='JSON Web Token is invalid. Try Again!'
            error=new ErrorHandler(message,400)
        }

        //hendlovajne greskom zbog isteklog jwt tokena
        if(err.name==='TokenExpiredError'){
            const message='JSON Web Token is expired. Try Again!'
            error=new ErrorHandler(message,400)
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
    }

    
}