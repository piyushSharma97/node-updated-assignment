var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');

var EmployeeModal = require('../modals/EmployeeModal')
var DepartmentModal = require('../modals/DepartmentModal');
var DepartmentControl = require('../controllers/Department')

function checkDepCode(req,res,next){
    var {departmet_code} = req.body
    if(departmet_code.length <2 || departmet_code.length >4){
      console.log('as',departmet_code);
      let send={
        errorMessage:'Department code lenth must be between 2 and 4'
      }
     return res.status(422).json(send)
    }else{
      next()
    }
   
  }
//Department Apis

router.post('/save_new_department',[
  body('departmet_Name','Min Length of Department Name is 3').isLength({ min: 3 }),
],checkDepCode,DepartmentControl.save_new_department)

router.get('/departmentSearch/:searchname',DepartmentControl.departmentSearch)

router.get('/view_all_Department/:page',DepartmentControl.view_all_Department)

router.put('/editDepartment/:id',DepartmentControl.post_edit_dept)

router.delete('/deleteDepartment/:id',DepartmentControl.delete_dept)

module.exports = router;
