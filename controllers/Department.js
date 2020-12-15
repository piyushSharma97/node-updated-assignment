var express = require('express');
var DepartmentModal = require('../modals/DepartmentModal');
var EmployeeModal = require('../modals/EmployeeModal')

exports.department_add_page =(req,res,next)=>{
    res.render('addDepartmet',{ title: 'Add New  Department',errors:'',success:'',msg:''})
  }

  exports.save_new_department=(req,res,next)=>{
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
  
  
  }

  exports.view_search_Department = async(req,res)=>{
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
    
  }

  exports.view_all_Department=async(req,res,next)=>{
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
    
  }
  exports.view_all__Department=async(req,res,next)=>{
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
    
  }

  exports.get_edit_dept =async (req,res,next)=>{
    try{
      let id = req.params.id
      let Depdartment = await DepartmentModal.findById(id).exec()
    
      res.render('editDepartment',{title:'Edit a Department',errors:'',success:'',records:Depdartment,id:id})
    }catch(e){
      res.status(401).json(e)
    }
  
  }

  exports.post_edit_dept =async (req,res,next)=>{
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
   
  }

  exports.delete_dept =async (req,res,next)=>{
    let id = req.params.id
    var Depdelete=DepartmentModal.findByIdAndDelete(id);
    Depdelete.exec((err)=>{
      if(err){
        console.error(err);
      }
      res.redirect('/view-all-Department')
    })
  }