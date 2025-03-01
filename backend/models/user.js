const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
const crypto=require('crypto')


//model korisnika
const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,'Please enter your name'],
    maxLength: [30,'Your name cannot exceed 30 characters']
  },
  email:{
     type:String,
     required:[true,'Please enter your email'],
     unique: true,
     validate:[validator.isEmail, 'Please enter valid email address']
  },
  password:{
    type:String,
    required:[true,'Please enter your password'],
    minlength:[6,'Your password must be longer than 6 characters'],
    select:false //kad prikazujem korisnika, da ne prikazujemo sifru
  },
  avatar:{
    public_id:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
  },
  role:{
    type:String,
    default:'user'
  },
  createAt:{
    type:Date,
    default:Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
  
})

//ekriptovanje sifre pre cuvanja u bazi

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
      next()
    }

    this.password=await bcrypt.hash(this.password,10);

})

//provera sifer korisnika

userSchema.methods.comparePassword=async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password)
}

//return JWT token
userSchema.methods.getJwtToken=function(){
  return jwt.sign({id:this._id},process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  })
}

//Generisanje tokena za resetovanje sifre
userSchema.methods.getResetPasswordToken=function(){
  //Generisanje tokena
  const resetToken=crypto.randomBytes(20).toString('hex');

  //Hasovanje i setovanje tokena za resetovanje
  this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex')

  //setovanje vremena nakon koga istice token
  this.resetPasswordExpire=Date.now()+30*60*1000;

  return resetToken;
}

module.exports=mongoose.model('User',userSchema);