//error handler klasa
class ErrorHandler extends Error{
    constructor(message,statusCode){
       //prosledjuje roditeljskoj klasi,error
        super(message);
        this.statusCode=statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports=ErrorHandler;