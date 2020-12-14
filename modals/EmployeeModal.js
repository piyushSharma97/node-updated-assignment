const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate');
const { Schema }  = mongoose

const EmployeeSchema = new Schema({
    Emp_Name:String,
    Employee_Code:{type: String,
        unique: true },
    Department:{type: String,
        required:true},
    DOJ:Date,
})
EmployeeSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Employee',EmployeeSchema)