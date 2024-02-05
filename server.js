require('dotenv').config()
const path = require('path')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500
const codeStream = require('./controllers/codeStreamController')
const cors = require('cors');

app.use(cors());

const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:3000"
  }
})

//configure Database connection
connectDB();

//set up GET response
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"index.html"));
});

//define socket event
//io.on('connection', codeStream);
io.on('connection', (stream)=>codeStream(stream))


//connect to database
mongoose.connection.once('open', ()=>{
  console.log('Connected to DB');
  server.listen(PORT, ()=>console.log(`server running on port ${PORT}`))
})