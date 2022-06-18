const express = require('express')
const mysql = require("mysql")
const app = express()
const cors = require('cors');
const port = process.env.port || 3000;
const connection = require('./db/conn');
const chatid_Generator = require('../src/Random_Gen');
const { restart } = require('nodemon');
const async = require('hbs/lib/async');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const { json } = require('express/lib/response');
const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;
var http = require('http').Server(app);
var io = require('socket.io')(http);
// const Register = require("./models/rejister");
// const AddChat = require('./models/chat');



//Whenever someone connects this gets executed
io.on('connection', function(socket){
  console.log('A user connected');
  
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
     console.log('A user disconnected');
  });
  socket.on('recive', function(data){
      const Sender_Id = data.username;
      const message = data.message;
      const chatId = data.chatId;
      const imagebase64image = data.base64image;
      const base64audio = data.base64audio;

      
      try {

        // to declare some path to store your converted image
        let path = 'images/'+Date.now()+'.png';
  
        let imgdata = data.base64image;
        
        // to convert base64 format into random filename
        let base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        
        fs.writeFileSync(`../public/`+path, base64Data,  {encoding: 'base64'});
         image = path;
  
    } catch (e) {
      console.log(e);
    }
    try {

      // to declare some path to store your converted image
      const path = 'audio/'+Date.now()+'.mp3';

      const audiodata = data.base64audio;
      
      // to convert base64 format into random filename
      const base64Data = audiodata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      
      fs.writeFileSync(`../public/`+path, base64Data,  {encoding: 'base64'});
       audio = path;

  } catch (e) {
      throw e;
  }

  const redData = {
    Sender_Id,
    message,
    audio,
    image,
  }
  io.sockets.emit('newMessage', redData)
  // connection.query('INSERT INTO '+ chatId + ' SET ?',redData, function (err, result) {
  //   if (err){
  //     console.log(err);
  //   }else{
  //     console.log("Done");
  //   }
  // });


      });
 });





app.use(cors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*'
}));


app.use(express.static('../public'));
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'hbs');
app.use(bodyParser.json());


app.get('/', cors(), (req, res) => {
  res.sendFile('/Users/qeratydevelopment/Desktop/Chat Application/ChatBackend/index.html');
})

app.post('/register', cors(), (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const data = {
    email,
    username,
    password
  }
  
  connection.query('INSERT INTO user SET ?',data, function (error, results, fields) {
    if (error) {
      res.json({
          error:true,
          message: error.message
      })
    }else{
        res.json({
          error:false,
          message:'user registered sucessfully'
      })
    }
  });


})

// Login Data
app.post('/login' , cors(), async(req , res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const data = {
      email,
      password
    };
    console.log(data);
    const sqlSearch = "Select * from User where email = ?";
    const search_query = mysql.format(sqlSearch,[email]);
    await connection.query (search_query, async (err, result) => {
      
      if (err) throw (err)
      if (result.length == 0) {
       const responce = {
         error: true,
         data: "User Not Found"
       }
       res.status(404).send(responce)
      } 
      else {
         const hashedPassword = result[0].password
         //get the hashedPassword from result
        if (password === hashedPassword) {
        const responce = {
          error : false,
          data : result
        }
        res.send(responce)
        } 
        else {
        const responce = {
          error : true,
          data : "Password Incorrect"
        }
        res.send(responce)
        } //end of bcrypt.compare()
      }//end of User exists i.e. results.length==0
     }); //end of connection.query()
    // const sqlSearch = "Select * from User where email = ? and password = ?";
    // const search_query = mysql.format(sqlSearch,[email, password]);
    // await connection.query (search_query, async (err, result) => {
    //   res.send({
    //     result: true,
    //     data: result
    //   });
    //   res.send(err);
    // })
    
})


// Search API

app.post('/search' ,cors(), async (req , res)=>{
    const username = req.body.username;
    const searchUser = `SELECT * FROM User WHERE username LIKE '%${username}%'`;
    //searchValues = [search,search,search,search]
    connection.query(searchUser, function (errQuery, resQuery) {
      if (errQuery) {
        const responce = {
          error : true,
          message : errQuery
        }
          res.send(responce)
      } else {
        const responce = {
          error : false,
          data : resQuery
        }
          res.send(responce)
      }
  })
})

// Chat With 


app.post('/chatWith' , cors(), (req , res) =>{
    var chat_ID = '';
      for ( var i = 0; i < 50; i++ )
        chat_ID += characters.charAt(Math.floor(Math.random() * charactersLength));
     console.log(chat_ID);
    const Search_User_Id = req.body.Search_User_Id;
    const User_Search_Id = req.body.User_Search_Id;
    const data = {
      chat_ID,
      Search_User_Id,
      User_Search_Id
    }
    checkQuery = "SELECT * FROM Reference WHERE Search_User_Id = "+ Search_User_Id +" AND User_Search_Id = " + User_Search_Id + " OR Search_User_Id = "+ User_Search_Id +" AND User_Search_Id = " + Search_User_Id;
    connection.query(checkQuery, function(error, result) {
      if (error) throw error;
      if(result.length > 0){
        res.send({
          error: true,
          data: result,
          message: 'Chat Already Exsist'
        });
        return;
      }else{
        connection.query('INSERT INTO Reference SET ?',data, function (error, results, fields) {
          if (error) {
          }else{
              const chatting_table = "CREATE TABLE " + chat_ID + "( id INT AUTO_INCREMENT PRIMARY KEY, Sender_Id VARCHAR(50) NOT NULL, message LONGTEXT, image LONGTEXT, audio LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP )";
              // const chatting_table = "CREATE TABLE "+ chat_ID +" ( NAME VARCHAR(50))";
              connection.query(chatting_table , function (err, res){
                if(err){
                  console.log(err);
                }else{
                  console.log(res);
                }
              })
              res.send({
                error :false,
                data: chat_ID,
                message:'user registered sucessfully'
            })
          }
        });
      }
    });
})


// Post Message 

app.post('/sendMessage', cors() ,(req , res)=>{

  const chatId = req.body.chatId;
      const message = req.body.message;
      const Sender_Id = req.body.username;
      var image = req.body.base64image;
      var audio = req.body.base64audio;
      try {

        // to declare some path to store your converted image
        const path = 'images/'+Date.now()+'.png';
  
        const imgdata = req.body.base64image;
        
        // to convert base64 format into random filename
        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        
        fs.writeFileSync(`../public/`+path, base64Data,  {encoding: 'base64'});
         image = path;
  
    } catch (e) {
        throw e;
    }


    // Audio Section 
    try {

      // to declare some path to store your converted image
      const path = 'audio/'+Date.now()+'.mp3';

      const audiodata = req.body.base64audio;
      
      // to convert base64 format into random filename
      const base64Data = audiodata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      
      fs.writeFileSync(`../public/`+path, base64Data,  {encoding: 'base64'});
       audio = path;

  } catch (e) {
      throw e;
  }




      const data = {
        message,
        Sender_Id,
        image,
        audio
      };
      console.log(data);
      connection.query('INSERT INTO '+ chatId + ' SET ?',data, function (err, result) {
        if (err){
          res.send({
            error : true,
            message: err
          })
        }else{
          res.send({
            error: false,
            data: "Message sent"
          });
        }
      });
      
})

// Receive Messages

app.post('/chats' , cors() , async (req , res)=>{
  var chats = [];
  const user_Id = req.body.user_Id;
  connection.query ("SELECT Chat_Id FROM Reference WHERE Search_User_Id = "+ user_Id +" OR User_Search_Id = "+ user_Id, async (err, result) => {
    if (err){
      throw (err)
    }else{
      if(result.length === 0){
        res.send({
          error: true,
          data: "No User Found"
        });
      }
      else{
        const rest = result;
        let result23 = rest.map(person => ({ message: person.Chat_Id}));
        var bar = new Promise((resolve, reject) => {
          result23.forEach((chatId, index, array) => {
            connection.query("SELECT * FROM "+ chatId.message +" ORDER BY `created_at` DESC LIMIT 1;" ,  async(err , result)=>{
              if(err) throw err
              else if(result.length !== 0){
                result.map((e)=>{
                  const data = {
                    id: e.id,
                    Sender_Id: e.Sender_Id,
                    message: e.message,
                    chatId: chatId.message,
                    created_at: e.created_at
                };
                chats.push(data);
                })
                
              
              }
              if (index === array.length -1) resolve(true);
            });
          });
      });
      bar.then(() => {
        res.send({
          error : false,
          data : chats
        })
      });
      }
    }
  
  
})
});



app.post("/getMessage" , (req , res)=>{
  const chat_Id = req.body.chat_Id;

  connection.query("SELECT * FROM "+chat_Id+"", function (err, result) {
    if (err){
      const responce = {
        error : true,
        message: err
      }
      res.send(responce)
    }else{
      const responce = {
        error : false,
        data: result
      }
      res.send(responce)
    }
    
  });
})









http.listen(port,  () => {
  console.log(`Runnning Server form port no :${port}`)
})