var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');

var EmployeeModal = require('../modals/EmployeeModal')
var DepartmentModal = require('../modals/DepartmentModal');
var EmployeeControl = require('../controllers/Employee')

function CheckEmpCode(req,res,next){
    var EmpCode = req.body.emp_code
    let check_empCode = EmployeeModal.find({employeeCode:EmpCode})
    check_empCode.exec(async(err,data)=>{
      if(err) throw err;
      if(data !=""){
        let send_data={
          errors:'Employee Code is already present',success:'', msg:'Employee Code must be Unique'
        }
        return res.status(402).json(send_data)
      }
      next();
    })
  }

  //Employees Apis
router.get('/add-new-employee',EmployeeControl.new_employee_page)

router.post('/save-new-employee',CheckEmpCode,[ body('employee_name','Min Length of Name is 3').isLength({ min: 3 })],EmployeeControl.save_new_employee)

router.get('/EmployeesDetails/:page',EmployeeControl.EmployeesDetails)

router.get('/employee_by_department/:department/:page',EmployeeControl.employee_by_department)

router.put('/editEmployee/:id',EmployeeControl.post_edit_employee)

router.delete('/employeesDelete/:id',EmployeeControl.delete_employee)

router.get('/Employeesearch/:name',EmployeeControl.Employeesearch)


module.exports = router;
