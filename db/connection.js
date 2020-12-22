const mongoose = require('mongoose');
var localDB="mongodb://localhost:27017/Employee"
var globalDB ='mongodb+srv://piyush5sarvika:sarvika5456@cluster0.4yvdu.mongodb.net/employee_crud?retryWrites=true&w=majority'

mongoose.connect(localDB, {  useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true});

module.exports =mongoose