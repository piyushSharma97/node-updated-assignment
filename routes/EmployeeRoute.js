var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');

var EmployeeModal = require('../modals/EmployeeModal')
var DepartmentModal = require('../modals/DepartmentModal');
var EmployeeControl = require('../controllers/Employee')

function CheckEmpCode(req,res,next){
    var empCode = req.body.employee_code
    if(empCode.length!==4){
      return res.status(422).json({error:"Employee code must only of 4 letters"})
    }
    let check_empCode = EmployeeModal.find({employeeCode:empCode})
    check_empCode.exec(async(err,data)=>{
      if(err) throw err;
  
      if(data !=""){
        let send_data={
          errors:'Employee Code is already present',success:'', msg:'Employee Code must be Unique'
        }
        return res.status(422).json(send_data)
      }
      next();
    })
  }

  //Employees Apis

router.post('/save-new-employee',CheckEmpCode,[ body('employee_name','Min Length of Name is 3').isLength({ min: 3 })],EmployeeControl.save_new_employee)

router.get('/EmployeesDetails/:page',EmployeeControl.EmployeesDetails)

router.get('/employee_by_department/:department/:page',EmployeeControl.employee_by_department)

router.put('/editEmployee/:id',EmployeeControl.post_edit_employee)

router.delete('/employeesDelete/:id',EmployeeControl.delete_employee)

router.get('/searchEmployees/:page/:name/:department',EmployeeControl.searchEmployees)
router.get('/getEmployee/:id',EmployeeControl.getEmployee)

module.exports = router;
