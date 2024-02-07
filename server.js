require('dotenv').config()
const path = require('path')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const cors = require('cors');
const {getAllCode, updateCodeViaStream} = require('./controllers/codeStreamController');
const PORT = process.env.PORT || 3000;

//configure Database connection
connectDB();

//connect to database
mongoose.connection.once('open', ()=>{
  console.log('Connected to DB');
})

const express = require('express')
const app = express()
const server = require('http').createServer(app)
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = require('socket.io')(server)

app.use(cors());

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

//fetch all current connections to keep up to date with clients
const getRoomConnections = async(room)=>{
  const connections = await io.in(room).fetchSockets()
  const connections_id = connections.map((conn)=> conn.id)
  return connections_id
}

//define socket events
//io.on('connection', codeStream);
io.on('connection', (socket) =>{
  //get current users connected
  getAllConnections().then((users)=>{
    io.emit('sent-users', users)
  })
  //get all code blocks
  socket.once('get-code-all',()=>{
      getAllCode().then((code)=>{
          socket.emit('init-all-code', code)
      })
  })
  //when asked for users, return connected users and 
  socket.on('get-users', ()=>{
    getAllConnections().then((users)=>{
    io.emit('sent-users', users)
     //get mentor
    io.emit('mentor-joined', users[0])
  })
  })
  socket.on('add-nickname',(nickname)=>{
    io.emit('sent-nicknames', nickname)
  })
  socket.on('join-room',(room)=>{
    socket.join(room)
    getRoomConnections(room).then((users)=>{
      io.emit('user-joined-room',{users:users, room:room})
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


module.exports = getAllConnections