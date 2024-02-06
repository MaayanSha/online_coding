const asyncHandler = require('express-async-handler');
const { json } = require('express/lib/response');
const Code = require('../models/Code')


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

const getAllConnections = asyncHandler(async()=>{
    await io.fetchSockets().then((sockets)=>console.log(sockets))
})

module.exports = getAllCode;