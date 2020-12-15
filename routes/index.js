var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var EmployeeModal = require('../modals/EmployeeModal')
var DepartmentModal = require('../modals/DepartmentModal');
var EmployeeControl = require('../controllers/Employee')

var DepartmentControl = require('../controllers/Department')
function CheckEmpCode(req,res,next){
  var EmpCode = req.body.emp_code

  let check_empCode = EmployeeModal.find({Employee_Code:EmpCode})
  check_empCode.exec(async(err,data)=>{
    if(err) throw err;
    if(data !=""){
      var data = await DepartmentModal.find({}).exec()
    return  res.render('addEmployee',{ title: 'Add New Employees',errors:'',success:'',data:data, msg:'Employee Code must be Unique'})
    }
    next();
  })
}
/* GET home page. */
router.get('/',async function(req, res, next) {
//   EmployeeModal.countDocuments({}).exec((err,Employee)=>{
//     console.log(err);
//     DepartmentModal.countDocuments({}).exec((err,Department)=>{    
//       console.log(err);
//       res.render('index', { title: 'Employee Details' , TotalEmployee:Employee ,TotalDepartment:Department ,});
//   });
// });
try{

  let Employee   =   await EmployeeModal.countDocuments({}).exec()
  let  Department = await DepartmentModal.countDocuments({}).exec()
  res.render('index', { title: 'Employee Details' , TotalEmployee:Employee ,TotalDepartment:Department ,});
}catch(e){
  console.log('error home');
  res.status(401).json(e)
}
});
//Employees Apis
router.get('/add-new-employee',EmployeeControl.new_employee_page)

router.post('/save-new-employee',CheckEmpCode,[ body('employee_name','Min Length of Name is 3').isLength({ min: 3 })],EmployeeControl.save_new_employee)

router.get('/EmployeesDetails/:page',EmployeeControl.EmployeesDetails)

router.get('/employee_by_department/:deprtment/:page',EmployeeControl.employee_by_department)

router.get('/employeesdetails/edit/:id',EmployeeControl.get_edit_employee)

router.post('/employee/edit',[ body('employee_name').isLength({ min: 3 })],EmployeeControl.post_edit_employee)

router.get('/employeesdetails/delete/:id',EmployeeControl.delete_employee)


router.post('/Employeesearch/',EmployeeControl.Employeesearch)

router.get('/autocomplete/', EmployeeControl.autocomplete)

//Department Apis
router.get('/add-new-Department',DepartmentControl.department_add_page)
function checkDepCode(req,res,next){
  var dep_code = req.body.departmet_code
 
  if(dep_code.length <2 || dep_code.length >4){
    
     return res.render('addDepartmet', { title: 'Add New  Department', errors:'',success:'',msg:'Department Code Length is between 2 and 4'});
  }else{
    next()
  }
 
}

router.post('/save-new-department',[
  body('departmetName','Min Length of Department Name is 3').isLength({ min: 3 }),
],checkDepCode,DepartmentControl.save_new_department)

router.get('/view-search-Department/:page',DepartmentControl.view_search_Department)

router.get('/view-all-Department/:page',DepartmentControl.view_all_Department)

router.get('/view-all-Department',DepartmentControl.view_all__Department)

router.get('/departmentdetail/edit/:id',DepartmentControl.get_edit_dept)

router.post('/department/edit',[
  body('department_name','Length of Name is Min 3').isLength({ min: 3 })
],checkDepCode,DepartmentControl.post_edit_dept)

router.get('/departmentdetail/delete/:id',DepartmentControl.delete_dept)

module.exports = router;
