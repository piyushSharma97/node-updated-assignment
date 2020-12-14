const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate');
const { Schema }  = mongoose

const departmentSchema = new Schema({
    Dep_Name:{type: String,
        unique: true },
    Dep_id  :Number,
    Dep_Code:{type: String,
        unique: true },
    Details:String,
})
departmentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Department',departmentSchema)