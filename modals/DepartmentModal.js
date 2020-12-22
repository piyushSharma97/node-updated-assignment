const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate');
const { Schema }  = mongoose

const departmentSchema = new Schema({
    departmentName:{type: String,
        unique: true },
    departmentId  :Number,
    departmentCode:{type: String,
        unique: true },
    departmentDetails:String,
})
departmentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Department',departmentSchema)