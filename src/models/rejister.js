const mongoose = require("mongoose");

const emplySchema = new mongoose.Schema ({
    email: {
        type: String,
        unique: true
    },
    username : {
        type: String,
        unique: true
        
    },
    password : {
        type: String,
        
    }
  })


  const Register = new mongoose.model("Register" , emplySchema);
  module.exports = Register;
