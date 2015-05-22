var fs = require('fs');
var zlib = require('zlib');
var debug = require('debug')('node-pre-compile-install');
var path = require('path');
var rimraf = require('rimraf');
var tar, request, packageJSON, config;

try {
  tar = require('tar');
  request = require('request');
} catch (error) {
  console.error('tar and request not available, skipping precompiled binary fetch');
  process.exit(0);
}

packageFile = path.join(process.cwd(),'package.json');

debug('package file',packageFile);

try {
  packageJSON = require(packageFile);
  config = require('./config')(packageJSON);
} catch(error) {
  console.error('unable to open', packageFile);
  process.exit(0);
}

var errorFunc = function(func, errorMsg) {
  if (typeof(func)==='function') { func(); return; }
  console.error(errorMsg);
}

var cleanup = function(file) {
  try {
    fs.stat(file, function (error, stats){
      if (!error && !(2 & parseInt((stats.mode & parseInt("777",8)).toString(8)[0]))) {
        debug('removing unwritable',file);
        rimraf.sync(file);
      }
    });
  } catch(error) {}
}

var download = function(url, onFileError, onBaseError, onExtractError) {
  debug('downloading from',url);
  request.get(url)
    .on('error', function(){
      errorFunc(onBaseError, 'base-path url not valid');
    })
    .pipe(zlib.Unzip())
    .on('error', function(){
      errorFunc(onFileError, 'no precompiled binary found for ' + config.name);
    })
    .pipe(tar.Extract({path: 'node_modules', strip: 1}))
    .on('entry', function(entry) {
      cleanup(path.join('node_modules', entry.path));
    })
    .on('error', function(error){
      errorFunc(onExtractError, 'tarball cannot write node_modules\n'+error);
    })
    .on('end', function() {
      debug("job's done");
    });
}

download(config.url, function() {
  debug('unable to download pre-compile modules for ' +
        config.name + ' =v' + config.version, '... trying latest');
  download(config.latestUrl);
});
