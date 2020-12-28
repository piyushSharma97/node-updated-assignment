var createError = require('http-errors');
var express = require('express');
var path = require('path');
require('./db/connection')


//'mongodb+srv://piyush5sarvika:sarvika5456@cluster0.4yvdu.mongodb.net/employee_crud?retryWrites=true&w=majority'
var indexRouter = require('./routes/index');
var employeeRouter = require('./routes/EmployeeRoute')
var departmentRouter = require('./routes/DepartmentRoute')
const port =4500
var app = express();





app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', employeeRouter);
app.use('/', departmentRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
res.status(err.status).json(er)
});
app.listen(port,()=>{
  console.log(`Server is running on port no ${port}`)
})


//	$productitem.product.compCode
