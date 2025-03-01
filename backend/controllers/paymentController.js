const catchAsyncErrors=require('../middlewares/catchAsyncErrors')


const stripe=require ('stripe')(process.env.STRIPE_SECRET_KEY)

//Rad sa placanjem => /api/v1/payment/process

exports.processPayment=catchAsyncErrors(async(req,res,next)=>{
   
    const paymentIntent=await stripe.paymentIntents.create({
        amount:req.body.amount,
        currency: 'usd',
        metadata: {integration_check: 'accept_a_payment'}
    })

    res.status(200).json({
        success:true,
        client_secret:paymentIntent.client_secret
    })
})

//Slanje api keya => /api/v1/stripeapi

exports.sendStripeApi=catchAsyncErrors(async(req,res,next)=>{


    res.status(200).json({
        stripeApiKey:process.env.STRIPE_API_KEY
    })
})

