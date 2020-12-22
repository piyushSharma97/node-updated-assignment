var express = require('express');
const { body, validationResult } = require('express-validator');
const resultAggregate=(perPage,page,departmentName)=>{
    return new Promise((resolve,reject)=>{
      EmployeeModal.aggregate(
        [
          {$match:{employeeDepartment:departmentName}},
          {
            $lookup:{
              from:'departments',
              localField:'employeeDepartment',
              foreignField:'departmentName',
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
            Department:"$department_name.departmentName",
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
      let response = await EmployeeModal.find({"employeeName": { '$regex': new RegExp(query, "i")}}).exec()
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
  let senddata={
    error:'',
    success:'',
    department:data.departmentName||"",
    msg:''
  }   
  res.status(200).json(senddata)
      // res.render('addEmployee',{ title: 'Add New Employees',errors:'',success:'',data:data ,msg:'' })
    }catch(e){
      res.status(401).json(e)
    }
  }

  exports.save_new_employee = async (req,res,next)=>{
    try{
      var deaprtment = await DepartmentModal.find({}).exec()
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        let sendData={
          error:errors.mapped(),
          success:'',
          data:"",
          msg:'',
          department:deaprtment||""
        }
        res.status(402).json(sendData)
      }else{
       
        let {employee_name,employee_dep_name,employee_doj,employee_code} = req.body
        let employeesDetails = new EmployeeModal({
          employeeName:employee_name,
          employeeCode:employee_code,
          employeeDepartment:employee_dep_name,
          dateOfJoining:employee_doj
        })
      
        employeesDetails.save(async function(err,data){
          if (err){
            res.status(401).json(err)
            return console.error(err)
          }   
          let sendData={
            error:"",
            success:'Employee Added Successfully',
            data:data,
            msg:'',
            department:deaprtment||""
          }
          res.status(201).json(sendData)
          // res.render('addEmployee',{title: 'Add New Employees',errors:'',, })
        })
      }
    }catch(e){
      res.status(401).json(e)
    }
  }

  exports.EmployeesDetails =async(req,res,next)=>{
    try{
   
         var perPage = 3
        var currentPage = req.params.page|| 1;
     EmployeeModal.find({})
     .skip((perPage * currentPage) - perPage)
     .limit(perPage)
     .exec(function(err, data) {
      if (err) return next(err)
      EmployeeModal.countDocuments().exec(async function(err, count) {
        let from =(perPage * currentPage) - perPage+1
        let to =from+perPage-1
             if (err) return next(err)
              let send_data={
                from:from,
                to:to,
                perPage:perPage,
                currentPage:Number(currentPage),
                lastPage:Math.ceil(count / perPage),
           
                total:count,
                content:[...data]
              }
          res.status(200).json(send_data)
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
     
      let {department} = req.params
      let aggregateResult = await resultAggregate(perPage,page,department)
      let count = await EmployeeModal.countDocuments({employeeDepartment:department}).exec()
      var departmentdata = await DepartmentModal.find({}).exec()
      let link =`/employee_by_department/${department}/`
      let send_data={
        from:1,
        to:Math.ceil(count / perPage),
        perPage:perPage,
        currentPage:Number(page),
        link:link,
        total:count||"",
        content:{
          department:departmentdata||"",
          employee:aggregateResult||""
        }
      }

      res.status(200).json(send_data)
    }catch(e){
      res.status(401).json(e)
    }
   
  }


  exports.post_edit_employee =async (req,res,next)=>{
    try{
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try{
        let {id} = req.params
        let employeeData = await EmployeeModal.findById(id).exec()
        let {employeeName,employeeCode,employeeDepartment,dateOfJoining} =employeeData  

        let { employee_name,employee_depart_name,employee_code,employee_doj } = req.body
        EmployeeModal.findByIdAndUpdate(id,{
          employeeName:employee_name || employeeName,
          employeeDepartment:employee_depart_name || employeeDepartment,
          employeeCode:employee_code || employeeCode,
          dateOfJoining:employee_doj ||dateOfJoining
      
        },{new: true},async function(err,doc){
          if (err){ 
            console.log(err) 
        }
 let send_data={
   data:doc,
   success:'Employee edited sucessfully'
 }
 res.status(201).json(send_data)
        })
      }
      catch(error){
       res.status(400).send(error)
      }
    }catch(e){
      res.status(401).json(e)
    }  
  }

  exports.delete_employee = async (req,res,next)=>{
    try{
      let {id} = req.params
      var Employeedelete= EmployeeModal.findByIdAndDelete(id);

      Employeedelete.exec((err,doc)=>{
        if(err){
          console.error(err);
        }
       let send={
         success:'Employee deleted successfully',
         response:doc
       }
       res.status(200).json(send)
      })
    }catch(e){
      res.status(401).json(e)
    }
  
  }

  exports.Employeesearch =async (req,res,next)=>{
    let query = req.params.name
   try{
    let response = await searchResult(query)
    var departmentdata = await DepartmentModal.find({}).exec()
    let link = `/Employeesearch/`
    let result ={
      department:departmentdata,
      linl:link,
      serchResult:response
    }
    res.status(200).json({result})
   }catch(e){
  res.status(401).json(e)
   }
  
  }