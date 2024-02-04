const mongoose = require('mongoose');

//async function to connect to mongo via mongoose with connection string
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URI)
    }
    catch (err){
        console.log(err)
    }
}

//export the function
module.exports = connectDB;