var os = require('os');

module.exports = function(packageJSON, defaults) {

  var PKG = 'node-pre-compile';
  var modified = {};
  packageJSON = packageJSON || {};

  var getValue = function(name, defaultValue) {
    var prop = PKG + '-' + name;
    var result =
      (defaults && typeof(defaults[name])==='string' && defaults[name]) ||
      process.env[prop.toUpperCase().replace(/-/g,'_')] ||
      (packageJSON && (packageJSON[prop] || packageJSON[name]));
    if (result !== undefined && result !== defaultValue) {
      modified[name] = true;
    }
    return result || defaultValue;
  }

  var getFile = function(name, version) {
    return getValue(name,
      [ pkgName,
        version,
        os.platform(),
        os.arch(),
        'node-modules'
      ].join('-') + '.tar.gz');
  }

  var getPath = function(name, version) {
    return getValue(name, (folder ? folder+'/' : '') + pkgName + '/' + version);
  }

  var pkgName = getValue('name', packageJSON.name);
  var pkgVersion = getValue('version', packageJSON.version);
  var folder = getValue('folder');
  var bucket = getValue('bucket', PKG);
  var region = getValue('region', 'us-west-2');
  var file = getFile('file', pkgVersion);
  var path = getPath('path', pkgVersion);
  var base = getValue('base', 'http://' + bucket + '.s3-website-' + region + '.amazonaws.com');
  var url = getValue('url', base + '/' + path + '/' + file);
  var latestFile = getFile('latest-file', 'latest');
  var latestPath = getPath('latest-path', 'latest');
  var latestUrl = getValue('latest-url', base + '/' + latestPath + '/' + latestFile);

  return {
    name: pkgName,
    version: pkgVersion,
    folder: folder,
    bucket: bucket,
    region: region,
    file: file,
    path: path,
    base: base,
    url: url,
    latestFile: latestFile,
    latestPath: latestPath,
    latestUrl: latestUrl,
    modified: modified
  }
};
