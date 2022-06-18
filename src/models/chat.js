const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema ({
    chatId: {
        type: String,
    },
    message : {
        type: String,
        
    }, 
    date : {
        type: Date,
        default : new Date()
    },
    userId: {
        type: String
    }

  })


  const AddChat = new mongoose.model("AddChat2" ,messageSchema);
  module.exports = AddChat;
