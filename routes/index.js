var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var EmployeeModal = require('../modals/EmployeeModal')
var DepartmentModal = require('../modals/DepartmentModal');

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
  res.status(401).json(e)
}
});
//Employees Apis
router.get('/add-new-employee',async (req,res,next)=>{
  try{
    var data = await DepartmentModal.find({}).exec()
 
    res.render('addEmployee',{ title: 'Add New Employees',errors:'',success:'',data:data ,msg:'' })
  }catch(e){
    res.status(401).json(e)
  }
 
})

router.post('/save-new-employee',CheckEmpCode,[
  body('employee_name','Min Length of Name is 3').isLength({ min: 3 })
],async (req,res,next)=>{
  try{
    var data = await DepartmentModal.find({}).exec()
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('addEmployee', { title: 'Add New  Employees',msg:'', errors:errors.mapped(),success:'',data:data});
    }else{
  
      let {employee_name} = req.body
      let { employee_dep_name } = req.body
      let { employee_doj } = req.body
      let {emp_code} =  req.body
      let employeesDetails = new EmployeeModal({
        Emp_Name:employee_name,
        Employee_Code:emp_code,
        Department:employee_dep_name,
        DOJ:employee_doj
      })
      employeesDetails.save(async function(err,data){
        if (err){
          return console.error(err)
        }
     
        res.render('addEmployee',{title: 'Add New Employees',errors:'',success:'Employee Added Successfully',data:data,msg:'' })
      })
    }

  }catch(e){
    res.status(401).json(e)
  }
  

})

router.get('/EmployeesDetails/:page',async(req,res,next)=>{
  try{
    var deprtment = await DepartmentModal.find({}).exec()
    var perPage = 3
      var page = req.params.page || 1
      let link =`/EmployeesDetails/`
   EmployeeModal.find({})
   .skip((perPage * page) - perPage)
   .limit(perPage)
   .exec(function(err, data) {
    EmployeeModal.countDocuments().exec(function(err, count) {
           if (err) return next(err)
          res.render('showEmloyees',{
            title:'List of All Employees',
            data:deprtment,
            current: page,
            records:data,
            query:'',
            link:link,
            pages: Math.ceil(count / perPage)
          })
       })
   })
  }catch(e){
    res.status(401).json(e)
  }
 
})
const resultAggregate=(perPage,page,departmentName)=>{
  return new Promise((resolve,reject)=>{
    EmployeeModal.aggregate(
      [
        {$match:{Department:departmentName}},
        {
          $lookup:{
            from:'departments',
            localField:'Department',
            foreignField:'Dep_Name',
            as:'department_name'
          }
        },
        { $skip  : ((perPage * page) - perPage) },
        { $limit : perPage },
        {$unwind:"$department_name"},
        {$project:{ 
          _id:1, 
          Emp_Name:1,
          Employee_Code:1,
          DOJ:1,
          Department:"$department_name.Dep_Name",
          }
       }
      ]
    ).then(function(result,err){
      resolve(result)
      })
      .catch((error) =>{
      console.log(error)
      reject(error)
      });
  })
}
router.get('/employee_by_department/:deprtment/:page',async (req,res,next)=>{
  try{
    let perPage = 2
    let page = req.params.page||1
    let {deprtment} = req.params
    let aggregateResult = await resultAggregate(perPage,page,deprtment)
    let count = await EmployeeModal.countDocuments({Department:deprtment}).exec()
    var department = await DepartmentModal.find({}).exec()
    let link =`/employee_by_department/${deprtment}/`
    res.render('showEmloyees',{
      title:'List of All Employees',
      data:department,
      current: page,
      query:'',
      records:aggregateResult,
       link:link,
      pages: Math.ceil(count / perPage)
    })
  }catch(e){
    res.status(401).json(e)
  }
 
})
router.get('/employeesdetails/edit/:id',async(req,res,next)=>{
  let id  = req.params.id
  var editEmp = await EmployeeModal.findById(id).exec()

  var data = await DepartmentModal.find({}).exec()

    res.render('editEmployee',{title:'Edit a Employee',errors:'',success:'',records:editEmp,id:id,data:data})
  
})
router.post('/employee/edit',[
  body('employee_name').isLength({ min: 3 })
],async (req,res,next)=>{
  try{
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
      let {id} = req.body
      let { employee_name } = req.body
      let { emp_depart_name } =req.body
      let  {emp_code} = req.body
      // let { employee_doj } = req.body
      EmployeeModal.findByIdAndUpdate(id,{
        Emp_Name:employee_name,
        Department:emp_depart_name,
        Employee_Code:emp_code
    
      },async function(err,doc){
        if (err){ 
          console.log(err) 
      }
    res.redirect('/EmployeesDetails/1')
      })
    }catch(error){
     res.status(400).send(error)
    }
  }catch(e){
    res.status(401).json(e)
  }
 
  
})
router.get('/employeesdetails/delete/:id',(req,res,next)=>{
  try{
    let id = req.params.id
    var Empdelete=EmployeeModal.findByIdAndDelete(id).exec();
    Empdelete.exec((err)=>{
      if(err){
        console.error(err);
      }
      res.redirect('/')
    })
  }catch(e){
    res.status(401).json(e)
  }

})

async function searchResult(query){
  return new Promise(async(resolve,reject)=>{
    let response = await EmployeeModal.find({"Emp_Name": { '$regex': new RegExp(query, "i")}}).exec()
    if(response!=''){
      resolve(response)
    }else{
      reject(response)
    }
  })
}
router.post('/Employeesearch/',async (req,res,next)=>{
  let query = req.body.searchName
 try{
  let response = await searchResult(query)


  console.log(response);
  var data = await DepartmentModal.find({}).exec()
  let link = `/Employeesearch/`
  let result ={
    total_dep:data,
    linl:link,
    serchResult:response
  }
  //res.status(200).json({result})
    res.render('showEmloyees',{
      title:'List of Search Employees',
      current: 1,
      records:response,
      link:link,
      data:data,
      query:query,
      pages: 1
    })
 }catch(e){
res.status(401).json(e)
 }

})
router.get('/autocomplete/', function(req, res, next){

  var regex = new RegExp(req.query["term"],'i')
  var employeeFilter =EmployeeModal.find({Emp_Name:regex},{'Emp_Name':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20); 
  employeeFilter.exec(function(err,data){
    console.log('data',data);
    var result =[]
    if(!err){
      if(data && data.length && data.length>0){
        data.forEach(user => {
          let obj ={
            id:user._id,
            label:user.Emp_Name
          };
          result.push(obj)
        });
      }
      console.log('data',result);
      res.jsonp(result)
    }
   
  })
  
   })
//Department Apis
router.get('/add-new-Department',(req,res,next)=>{
  res.render('addDepartmet',{ title: 'Add New  Department',errors:'',success:'',msg:''})
})
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
],checkDepCode,(req,res,next)=>{
  try{
    var millisecond = new Date().getUTCMilliseconds();
    var randomNo = Math.floor(Math.random()*211+3)
    let {departmetName} = req.body
    let {departmet_code} = req.body
    let { dep_details } = req.body
    let dep_id = randomNo+millisecond
    let errors = validationResult(req);
    console.log(errors.mapped());
    if (!errors.isEmpty()) {
      res.render('addDepartmet', { title: 'Add New  Department', errors:errors.mapped(),success:'',msg:''});
    }else{
      var depdatmentDetails  = new DepartmentModal({
        Dep_Name:departmetName,
        Dep_id:dep_id,
        Dep_Code:departmet_code,
        Details:dep_details
      })
      depdatmentDetails.save(function(err,data){
        if (err){
          return console.error(err)
        }
      res.render('addDepartmet',{title: 'Add New  Department',errors:'', success:'Department  inserted successfully',msg:''})
      })
    }

  }catch(e){
    res.status(401).json(e)
  }


})
router.get('/view-search-Department/:page',async(req,res)=>{
  try{
    var perPage = 2
    var page = req.params.page || 1
   var queryDept =  req.query.search_dept||""
   DepartmentModal.find({"Dep_Name": { '$regex': new RegExp(queryDept, "i")}})
   .skip((perPage * page) - perPage)
   .limit(perPage)
   .exec(function(err, data) {
     console.log(data);
    DepartmentModal.countDocuments({"Dep_Name": { '$regex': new RegExp(queryDept, "i")}}).exec(function(err, count) {
           if (err) return next(err)
          res.status(200).render('showDepartments',{
            title:'Show  Department',
            current: page,
            records:data,
            pages: Math.ceil(count / perPage)
          })
       })
   })

  }catch(e){
    res.status(401).json(e)
  }
  
})
router.get('/view-all-Department/:page',async(req,res,next)=>{
  try{
    var perPage = 2
    var page = req.params.page || 1
 DepartmentModal.find({})
 .skip((perPage * page) - perPage)
 .limit(perPage)
 .exec(function(err, data) {
  DepartmentModal.countDocuments().exec(function(err, count) {
         if (err) return next(err)
        res.render('showDepartments',{
          title:'Show All Department',
          current: page,
          records:data,
          pages: Math.ceil(count / perPage)
        })
     })
 })
  }catch(e){
    res.status(401).json(e)
  }
  
})
router.get('/view-all-Department',async(req,res,next)=>{
  try{
    let options = {
      offset:   0,
      page:  1, 
      limit:    2
  };
  DepartmentModal.paginate({},options).then(function(result){
  res.render('showDepartments',{
    title:'Show All Department',
    records:result.docs,
    current:options.page,
    pages: Math.ceil(result.total / result.limit) 
     })
   })
  }catch(e){
    res.status(401).json(e)
  }
  
})
router.get('/departmentdetail/edit/:id',async (req,res,next)=>{
  try{
    let id = req.params.id
    let Depdartment = await DepartmentModal.findById(id).exec()
  
    res.render('editDepartment',{title:'Edit a Department',errors:'',success:'',records:Depdartment,id:id})
  }catch(e){
    res.status(401).json(e)
  }

})

router.post('/department/edit',[
  body('department_name','Length of Name is Min 3').isLength({ min: 3 })
],checkDepCode,async (req,res,next)=>{
  try{
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('addDepartmet', { title: 'Add New  Department', errors:errors.mapped(),success:'',msg:''});
    }
     let {id} =req.body
     let {department_name} = req.body
     let {department_code} = req.body
     let {dep_details} = req.body
  
     DepartmentModal.findByIdAndUpdate(id,{
      Dep_Name:department_name,
      Dep_Code:department_code,
      Details:dep_details
     },async function(err,doc){
      if (err){ 
        console.log(err) 
    }
    // let response  = await DepartmentModal.find({})
    // var data =response
    res.redirect('/view-all-Department')
     })
  }catch(e){
    res.status(401).json(e)
  }
 
})

router.get('/departmentdetail/delete/:id',async (req,res,next)=>{
  let id = req.params.id
  var Depdelete=DepartmentModal.findByIdAndDelete(id);
  Depdelete.exec((err)=>{
    if(err){
      console.error(err);
    }
    res.redirect('/view-all-Department')
  })
})
module.exports = router;
