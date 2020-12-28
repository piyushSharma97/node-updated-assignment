var express = require('express');
var DepartmentModal = require('../modals/DepartmentModal');
var EmployeeModal = require('../modals/EmployeeModal')
const { body, validationResult } = require('express-validator');

  exports.save_new_department=(req,res,next)=>{
    try{
     
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        let error={
          error:errors.mapped(),
          msg:'Correct the error'
        }
        res.status(400).json({error})
      }else{
        var millisecond = new Date().getUTCMilliseconds();
        var randomNo = Math.floor(Math.random()*211+3)
        let {departmet_Name,departmet_code,department_details} = req.body
        let department_id = randomNo+millisecond

        var depdatmentDetails  = new DepartmentModal({
          departmentName:departmet_Name,
          departmentId:department_id,
          departmentCode:departmet_code,
          departmentDetails:department_details
        })
        depdatmentDetails.save(function(err,data){
          if (err){
            res.status(422).json(err)
            return console.error(err)
          }
          let send={
            errors:'', success:'Department inserted successfully',msg:'',data:data
          }
          res.status(201).json(send)
        })
      }
    }catch(e){
      res.status(400).json(e)
    }
  }

  exports.departmentSearch = async(req,res)=>{
    try{

     var queryDepartment =  req.params.searchname
     DepartmentModal.find({"departmentName": { '$regex': new RegExp(queryDepartment, "i")}})
    .sort({"departmentName":1})
     .exec(function(err, data) {
     if(err){
       return res.status(422).json({err})
     }
     let send_data={
       keyword:queryDepartment,
       response:data
     }
res.status(200).json(send_data)
     })
  
    }catch(e){
      res.status(401).json(e)
    }
  }

  exports.view_all_Department=async(req,res,next)=>{
    try{

      var perPage = 2
      var page = req.params.page || 1
    
   DepartmentModal.find({})
   .sort({"departmentName":1})
   .skip((perPage * page) - perPage)
   .limit(perPage)
   .exec(function(err, data) {
    if (err) return next(err)
    DepartmentModal.countDocuments().exec(function(err, count) {
      let from =(perPage * page) - perPage+1
      let to =perPage * page
           if (err) return next(err)
           let send_data={
            from: from,
            to: to,
            perPage: perPage,
            currentPage: page,
            lastPage: Math.ceil(count / perPage),
            total: count,
            content: [...data]
         }
         
res.status(200).json(send_data)
       })
   })
    }catch(e){
      res.status(401).json(e)
    }
    
  }

  exports.post_edit_dept =async (req,res,next)=>{
    try{
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({error:errors.mapped()})
      }
       let {id} =req.params
       let departmentdetail = await DepartmentModal.findById(id).exec()
       let {departmentName,departmentCode,departmentDetails} = departmentdetail
       let {department_name,department_code,department_details} = req.body
       DepartmentModal.findByIdAndUpdate(id,{
        departmentName:department_name||departmentName,
        departmentCode:department_code||departmentCode,
        departmentDetails:department_details||departmentDetails
       },{new: true},function(err,doc){
        if (err){ 
          console.log(err) 
      }
    
  let send={
    success:'Department is edited succcessfully',
response:doc
  }
res.status(201).json(send)
       })
    }catch(e){
      res.status(401).json(e)
    }
   
  }

  exports.delete_dept =async (req,res,next)=>{
    let id = req.params.id
    var Depdelete=DepartmentModal.findByIdAndDelete(id);
    Depdelete.exec((err,data)=>{
      if(err){
        console.error(err);
      }
      let send_data={
        message:'deartment is deleted succesfully',
       response:data
      }
      res.status(200).json(send_data)
    })
  }