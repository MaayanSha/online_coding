const mongoose = require('mongoose');

//schema model setup for code document
//fields are title and code
//timestamps added for tracking purposes
const codeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    code:  {
        type:String,
        required: true,
    },
},
{ timestamps: true }
)

//export the Code model under the collection "codes"
module.exports = mongoose.model('Code', codeSchema, "codes");