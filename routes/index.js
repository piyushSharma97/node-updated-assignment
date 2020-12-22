var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var EmployeeModal = require('../modals/EmployeeModal')
var DepartmentModal = require('../modals/DepartmentModal');



/* GET home page. */
router.get('/',async function(req, res, next) {
try{

  let Employee   =   await EmployeeModal.countDocuments({}).exec()
  let  Department = await DepartmentModal.countDocuments({}).exec()
  let data={
    No_of_employees:Employee,
    No_of_department:Department
  }
  res.status(200).json({data})
}catch(e){
  console.log('error home');
  res.status(401).json(e)
}
});





module.exports = router;
