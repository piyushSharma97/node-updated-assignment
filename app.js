var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
var localDB="mongodb://localhost:27017/Employee"
var globalDB ='mongodb+srv://piyush5sarvika:sarvika5456@cluster0.4yvdu.mongodb.net/employee_crud?retryWrites=true&w=majority'
mongoose.connect(globalDB, {  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true});
//'mongodb+srv://piyush5sarvika:sarvika5456@cluster0.4yvdu.mongodb.net/employee_crud?retryWrites=true&w=majority'
var indexRouter = require('./routes/index');
const port =4500
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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
  res.render('error');
});
app.listen(port,()=>{
  console.log(`Server is running on port no ${port}`)
})
module.exports = app;

//	$productitem.product.compCode
