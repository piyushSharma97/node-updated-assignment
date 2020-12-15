var express = require('express');

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
var EmployeeModal = require('../modals/EmployeeModal')
var DepartmentModal = require('../modals/DepartmentModal');

exports.new_employee_page = async (req,res,next)=>{
    try{
      var data = await DepartmentModal.find({}).exec()
   
      res.render('addEmployee',{ title: 'Add New Employees',errors:'',success:'',data:data ,msg:'' })
    }catch(e){
      res.status(401).json(e)
    }
  }

  exports.save_new_employee = async (req,res,next)=>{
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
  }

  exports.EmployeesDetails =async(req,res,next)=>{
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
   
  }

  exports.employee_by_department =async (req,res,next)=>{
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
   
  }

  exports.get_edit_employee =async(req,res,next)=>{
    let id  = req.params.id
    var editEmp = await EmployeeModal.findById(id).exec()
  
    var data = await DepartmentModal.find({}).exec()
  
      res.render('editEmployee',{title:'Edit a Employee',errors:'',success:'',records:editEmp,id:id,data:data}) 
  }

  exports.post_edit_employee =async (req,res,next)=>{
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
  }

  exports.delete_employee = async (req,res,next)=>{
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
  
  }

  exports.Employeesearch =async (req,res,next)=>{
    let query = req.body.searchName
   try{
    let response = await searchResult(query)
  
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
  
  }

  exports.autocomplete =function(req, res, next){
    console.log(req.query);
    console.log(req.body);
      var regex = new RegExp(req.query["term"],'i')
      var employeeFilter =EmployeeModal.find({Emp_Name:regex},{'Emp_Name':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20); 
      employeeFilter.exec(function(err,data){
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
          res.jsonp(result)
        }
       
      })
      
       }