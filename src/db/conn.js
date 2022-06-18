// const express = require("express");
// const mongoose = require("mongoose");
// const DB = "mongodb://127.0.0.1:27017/chattingBackend"
// mongoose.connect(DB,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// ).then(()=>{
//     console.log("Connection is Successfull");
// }).catch(()=>{
//     console.log("No Connection");
// })

const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Chatting_System"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
})




module.exports = con;