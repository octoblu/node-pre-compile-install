try {

  var fs = require('fs');
  var os = require('os');
  var zlib = require('zlib');
  var debug = require('debug')('node-pre-compile-install');
  var path = require('path');
  var rimraf = require('rimraf');
  var tar, request, packageJSON;

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
  } catch(error) {
    console.error('unable to open', packageFile);
    process.exit(0);
  }

  var BASE_PATH = packageJSON['pre-compile-base-path'] ||
    'http://node-pre-compile.s3-website-us-west-2.amazonaws.com'

  var getUrl = function(packageJSON){
    var filename = [packageJSON.name, packageJSON.version, os.platform(), os.arch(), 'node-modules'].join('-') + '.tar.gz';
    var path = 'npm/' + packageJSON.name + '/' + packageJSON.version + '/' + filename;
    return BASE_PATH + '/' + path;
  };

  try {
    var node_module_path = path.join(process.cwd(),'node_modules');
    stats = fs.lstatSync(node_module_path);
    // Is it a directory?
    if (stats.isDirectory() || statis.isFile()) {
      debug('rimraf',node_module_path);
      rimraf.sync(node_module_path);
    }
  } catch (error) {}

  var url = getUrl(packageJSON);
  debug("downloading", url);

  request.get(url)
    .on('error', function(){
      console.error('base-path url not valid');
      process.exit(0);
    })
    .pipe(zlib.Unzip())
    .on('error', function(){
      console.error('no precompiled binary found');
      process.exit(0);
    })
    .pipe(tar.Extract({path: 'node_modules', strip: 1}))
    .on('error', function(){
      console.error('tarball cannot write node_modules');
      process.exit(0);
    })
    .on('end', function() {
      debug('job\'s done');
    });

} catch(error) {
  console.error('install failed with message "', error.message, '"');
  process.exit(0);
}
