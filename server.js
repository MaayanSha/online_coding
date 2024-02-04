require('dotenv').config()
const path = require('path')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500
const codeStream = require('./controllers/codeStreamController')

//configure Database connection
connectDB();

//set up GET response
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"index.html"));
});

//define socket event
io.on('connection', codeStream);

//connect to database
mongoose.connection.once('open', ()=>{
  console.log('Connected to DB');
  app.listen(PORT, ()=>console.log(`server running on port ${PORT}`))
})