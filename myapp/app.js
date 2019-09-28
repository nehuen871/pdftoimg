var createError = require('http-errors');
var pdftoimage = require('pdftoimage');
var sharp = require('sharp');
var PDF2Pic = require("pdf2pic");
var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var file = path.join(__dirname, 'pdfs');
fileP = file + "/04091929.pdf";
//console.log(file);

//joining path of directory 
const folderPaths = path.join(__dirname, 'pdfs');
const folderPathsImagenes = path.join(__dirname, 'imgs');
const folderPathsFinal = path.join(__dirname, 'final');
/** Retrieve file paths from a given folder and its subfolders. */
const getFilePaths = (folderPath) => {
  const entryPaths = fs.readdirSync(folderPath).map(entry => path.join(folderPath, entry));
  const filePaths = entryPaths.filter(entryPath => fs.statSync(entryPath).isFile());
  const dirPaths = entryPaths.filter(entryPath => !filePaths.includes(entryPath));
  const dirFiles = dirPaths.reduce((prev, curr) => prev.concat(getFilePaths(curr)), []);
  return [...filePaths, ...dirFiles];
};
var arrayPath = getFilePaths(folderPaths);

for(i=0;i<arrayPath.length;i++){
  var nuevaCarpeta = folderPathsImagenes+ "/" + path.basename(arrayPath[i], path.extname(arrayPath[i]));
  fs.mkdirSync(nuevaCarpeta);

  pdftoimage(arrayPath[i], {
    format: 'tiff',  // png, jpeg, tiff or svg, defaults to png
    prefix: 'img',  // prefix for each image except svg, defaults to input filename
    outdir: nuevaCarpeta   // path to output directory, defaults to current directory
  })
  .then(function(){
    console.log('Conversion done');
  })
  .catch(function(err){
    console.log(err);
  });
};

var arrayPathImg = getFilePaths(folderPathsImagenes);

for(a=0;a<arrayPathImg.length;a++){
  var aa = path.dirname(arrayPathImg[a]);
  finalFinal = aa.replace('imgs', 'final');
  if(!fs.existsSync(finalFinal)){
    fs.mkdirSync(finalFinal);
  }
  var archivoFinal = finalFinal + "/" + path.basename(arrayPathImg[a], path.extname(arrayPathImg[a])) + ".tiff";
  sharp(arrayPathImg[a])
  .tiff({
    compression: 'lzw',
    yres: 118.111,
    xres: 118.111,
    squash: true
  })
  .toFile(archivoFinal);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
