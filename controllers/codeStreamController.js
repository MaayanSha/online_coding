const asyncHandler = require('express-async-handler');
const Code = require('../models/Code')

//controller handler for fetching all code blocks
const getCode = asyncHandler(async(req, res)=>{
    //find all code blocks currently stored in DB
    const codeSnippets = await Code.find().lean()
    //if not found, return status 400(Not Found)
    if (!codeSnippets | codeSnippets.length == 0){
        return res.status(400).json({message: 'no code blocks here yet'})
    }
    //return JSON-formatted code blocks
    res.json(codeSnippets)
    })


//controller handler for updating code block in the database
const updateCodeViaStream = asyncHandler(async(stream)=>{
    //find code block according to title, then update code content
    const codeSnippet = await Code.findOneAndUpdate({title:stream.title}, {
        code:stream.code
    })
    //return status according to result
    if (codeSnippet){
        return res.status(200).json({message:'code block updated successfully'})
    }
    else{
        return res.status(500).json({message:'failed updating code block'})
    }
})


//callback function for the io.on connection middleware.
//defines the different events listeners
const codeStream = (socket) => {
    //logger for succesfull connection
    socket.on('connected', ()=>{
        console.log(`user connected, socket id: ${socket.id}`)
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