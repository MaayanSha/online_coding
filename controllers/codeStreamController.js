const asyncHandler = require('express-async-handler');
const { json } = require('express/lib/response');
const Code = require('../models/Code')

const connectedUsers = [];

//controller handler for fetching all code blocks
const getAllCode = asyncHandler(async()=>{
    //find all code blocks currently stored in DB
    const codeSnippets = await Code.find().lean()
    //if not found, return error
    if (!codeSnippets | codeSnippets.length == 0){
        return {message: 'no code blocks here yet'}
    }
    //return JSON-formatted code blocks
    return codeSnippets
    })

const fetchBlock = asyncHandler(async(title)=>{
    //find the requested code block
    const codeBlock = await Code.findOne({title:title})
    //in case something went wrong
    if (!codeBlock){
        return {message:"error fetching title"}
    }
    //if found, wrap in json and return
    return codeBlock
})


//controller handler for updating code block in the database
const updateCodeViaStream = asyncHandler(async(stream)=>{
    //find code block according to title, then update code content
    const codeSnippet = await Code.findOneAndUpdate({title:stream.title}, {
        code:stream.code
    })
    //return status according to result
    if (codeSnippet){
        return {message:'code block updated successfully'}
    }
    else{
        return {message:'failed updating code block'}
    }
})


//callback function for the io.on connection middleware.
//defines the different events listeners
const codeStream = (socket) => {
    //logger for succesfull connection
    //emits the code from the DB
    socket.on('connect', (socket)=>{
    })
    socket.on('get-mentor',()=>{
        socket.emit('mentor-joined', connectedUsers[0])
    })
    socket.once('get-code-all',()=>{
        connectedUsers.push(socket.id)
        getAllCode().then((code)=>{
            socket.emit('init-all-code', code)
        })
    })
    socket.on('get-code-title', (title)=>{
        const code = fetchBlock()
        socket.emit('init-code', code)
    })
    socket.on('disconnect', user =>{
        connectedUsers.filter((id)=>id!=user)
    })
    //when code block changes, the change is emitted to all clients
    socket.on('send-code-change', (stream)=>{
        socket.emit('code-changed', stream)
    })
    //when client chooses to save changes, new code is saved in DB and a message is broadcasted.
    socket.on('save-code-block', (stream)=>{
        updateCodeViaStream(stream)
        socket.emit('changes-saved', 'changes saved to DB')
    })
}
module.exports = codeStream;