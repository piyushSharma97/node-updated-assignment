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
           {$sort: {"employeeName": 1}},
          { $skip  : ((perPage * page) - perPage) },
          { $limit : perPage },
          {$unwind:"$department_name"},
          {$project:{ 
            _id:1, 
            employeeName:1,
            employeeCode:1,
            dateOfJoining:1,
            departmentName:"$department_name.departmentName",
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
    
    }catch(e){
      res.status(401).json(e)
    }
  }

  exports.save_new_employee = async (req,res,next)=>{
    try{  
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        let sendData={
          error:errors.mapped(),
          success:'',
          data:"",
          msg:'',
        }
       return res.status(402).json(sendData)
      }else{
        let {employee_name,employee_department_name,employee_doj,employee_code} = req.body
        var deaprtments = await DepartmentModal.find({"departmentName":employee_department_name}).select('departmentName')
          let available = deaprtments.some(department=>{
          if(employee_department_name==department.departmentName){
            return true
          }else{
            return false
          }
        })
        if(available){
          let employeesDetails = new EmployeeModal({
            employeeName:employee_name,
            employeeCode:employee_code,
            employeeDepartment:employee_department_name,
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
            }
            res.status(201).json(sendData)
          })
        }else{
          let send={
            message:"Department does not exist"
          }
          res.status(400).json(send)
        }
    
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
     .sort({employeeName:1})
     .skip((perPage * currentPage) - perPage)
     .limit(perPage)
     .exec(function(err, data) {
      if (err) return next(err)
      EmployeeModal.countDocuments().exec(async function(err, count) {
        let from =(perPage * currentPage) - perPage+1
        let to =perPage * currentPage
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
exports.getEmployee=async(req,res)=>{
  try{
  let {id}= req.params
let response = await EmployeeModal.findById(id).exec()

res.status(200).json(response)

  }catch(error){
    let send={
      error:error
    }
    res.status(400).json(send)
  }
}
  exports.employee_by_department =async (req,res,next)=>{
    try{
      let perPage = 4
      let page = req.params.page||1
     
      let {department} = req.params
      let aggregateResult = await resultAggregate(perPage,page,department)
      let count = await EmployeeModal.countDocuments({employeeDepartment:department}).exec()
      var departmentdata = await DepartmentModal.find({}).exec()
      let link =`/employee_by_department/${department}/`
       let from=page*perPage-(perPage-1);
    let to= page*perPage;
      let send_data={
        from:from,
        to:to,
        perPage:perPage,
        currentPage:Number(page),
        link:link,
        total:count||"",
        content:[...aggregateResult]
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
        if(employee_depart_name==undefined){
          console.log('empty',employee_depart_name);
        }else{
          console.log('not',employee_depart_name);
        }
          let deaprtments = await DepartmentModal.find({"departmentName":employee_depart_name}).select('departmentName')
          let available = deaprtments.some(department=>{
          if(employee_depart_name==department.departmentName){
            return true
          }else{
            return false
          }
        })
        if(available||employee_depart_name==undefined){
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
        }else{
          res.status(400).json({message:"Department does not exist"})
        }

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

  exports.searchEmployees =async (req,res,next)=>{
 
   try{
     let page= req.params.page||1
     let perPage =2
     let name = req.params.name||""
     let department = req.params.department||""
     let response = await EmployeeModal.find({ $and:[ {"employeeName": { '$regex': new RegExp(name, "i")}}, {'employeeDepartment':{ '$regex': new RegExp(department, "i")}}]})
                               .sort({employeeName:1})
                               .skip((perPage * page) - perPage)
                               .limit(perPage)
                               .exec()

      let from=page*perPage-(perPage-1);
      let to= page*perPage;
      let send_data={
        from:from,
        to:to,
        perPage:perPage,
        currentPage:Number(page),
        total:response.length||"",
        content:[...response]
      }

    res.status(200).json(send_data)
   }catch(e){
  res.status(401).json(e)
   }
  
  }