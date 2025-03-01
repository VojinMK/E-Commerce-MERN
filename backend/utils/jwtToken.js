//kreiranje i slanje tokena, kao i cuvanje u cookieima

const sendToken=(user,statusCode,res)=>{
 
    //kreiranje jwt tokena 

    const  token= user.getJwtToken();

    //opcije za cookie
    const options={
        expires: new Date(
            Date.now()+process.env.COOKIE_EXPIRES_TIME*24*60*60*1000
        ),
        httpOnly:true //sigurnije
    }

    res.status(statusCode).cookie('token',token ,options).json({
        successs:true,
        token,
        user
    })
}

module.exports=sendToken;