const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate');
const { Schema }  = mongoose

const EmployeeSchema = new Schema({
    employeeName:String,
    employeeCode:{type: String,
        unique: true },
    employeeDepartment:{type: String,
        required:true},
    dateOfJoining:Date,
})
EmployeeSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Employee',EmployeeSchema)