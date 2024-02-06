require('dotenv').config()
const path = require('path')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500
const getAllCode = require('./controllers/codeStreamController')
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

//fetch all current connections to keep up to date with clients
const getAllConnections = async()=>{
  const connections = await io.fetchSockets()
  const connections_id = connections.map((conn)=> conn.id)
  return connections_id
}

//define socket events
//io.on('connection', codeStream);
io.on('connection', (socket)=>{
  //get current users connected
  getAllConnections().then((users)=>{
    io.emit('sent-users', users)
     //get mentor
    io.emit('mentor-joined', users[0])
  })
  //get all code blocks
  socket.once('get-code-all',()=>{
      getAllCode().then((code)=>{
          socket.emit('init-all-code', code)
      })
  })
  //get a specific code block
  socket.on('get-code-title', (title)=>{
      const code = fetchBlock(title).then((code)=> {
          socket.emit('init-code', code)
      })
  })
  //when code block changes, the change is emitted to all clients
  socket.on('send-code-change', (stream)=>{
      io.emit('code-changed', stream)
  })
  //when client chooses to save changes, new code is saved in DB and a message is broadcasted.
  socket.on('save-code-block', (stream)=>{
      updateCodeViaStream(stream)
      socket.emit('changes-saved', 'changes saved to DB')
  })
})


//connect to database
mongoose.connection.once('open', ()=>{
  console.log('Connected to DB');
  server.listen(PORT, ()=>console.log(`server running on port ${PORT}`))
})