require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const nocache = require("nocache");
var expbs=require('express-handlebars')
var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var session=require('express-session')
var app = express();
var db=require('./config/connection');

//hbs helpers

const hbs=expbs.create({
  extname:'hbs',defaultLayout:'layout',
  layoutsDir:__dirname+'/views/layout/', 
  partialDir:__dirname+'/views/partials/',

   helpers:{
   
      ifEquals:(value1,value2,value3,options)=>{

        if(value1==value2){
            if(value3){
                return options.fn(value3)
            }
           return options.fn()
        }else{
            if(value3)
            {   
                return options.inverse(value3);      
            }
            return options.inverse();   
        }
    }
   }

})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine)

app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({secret:process.env.SESSION_SECRET_KEY,cookie:{maxAge:600000}}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.connect((err)=>{
  if(err) console.log('error');
  else console.log('dataBase connected');
 
})

app.use('/admin', adminRouter);

app.use('/admin/*',(req,res)=>{
  res.render('admin/error')
})
app.use('/', indexRouter);


app.use('/*',(req,res)=>{
  res.render('user/error')
})



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

module.exports = app;
