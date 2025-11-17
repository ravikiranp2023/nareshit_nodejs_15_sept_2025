const mongoose = require('mongoose');

function connectDB(dbName = 'nareshit_sept_2025') {
    mongoose.connect(`mongodb+srv://sanjaysamantra1:berhampur@cluster0.ga81v5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
        .then(() => console.log('Connected To Database!'))
        .catch(err=>{console.log('Error connecting DB')})
}

module.exports = { connectDB };