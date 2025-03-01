const { json } = require("express");

class APIFeatures {
    constructor(query, queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
   
    search(){
        //pretrazujemo na osnovu imena
        //ako postoji, uzimamo iz baze,a ko ne, onda nista
        const keyword=this.queryStr.keyword?{
          name:{
            $regex: this.queryStr.keyword, 
            $options: 'i' //nije keysenstiive
          }
        }:{}

        this.query=this.query.find({...keyword});
        return this;
    }
    // filteri za pretragu
    filter(){
       const queryCopy={...this.queryStr};//kreireanje kopije

       //uklanjanje odedjenih polja iz queryja, jer nam ne treba to vec kategorija
       const removeFields=['keyword','limit','page']
       removeFields.forEach(el=>delete queryCopy[el]);
       

       //napredniji filter za cenu, ocene...
       let queryStr=JSON.stringify(queryCopy);
       queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,match=>`$${match}`) //stavlja dolar ispred operatora, zbog monga, jer svi opretori idu sa $,{"price":{"$gte":"100","$lte":"1000"}}
       

       this.query=this.query.find(JSON.parse(queryStr));
       return this;
    }

    pagination(resPerPage){
        const currentPage=Number(this.queryStr.page) || 1;
        const skip=resPerPage *(currentPage-1); //npr 2 strana, skipujemo privh 10 proizvoda

        this.query=this.query.limit(resPerPage).skip(skip); //limitiramo broj koje salje, i skipujemo na osnovu skipa
        return this;
    }
}
module.exports=APIFeatures;