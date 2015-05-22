var os = require('os');

module.exports = function(packageJSON) {

  var PKG = 'node-pre-compile';

  getValue = function(name, defaultValue) {
    var prop = PKG + '-' + name;
    return packageJSON[prop] || process.env[prop.toUpperCase().replace(/-/g,'_')] || defaultValue;
  }

  getFile = function(name, version) {
    return getValue(name,
      [ packageJSON.name,
        version,
        os.platform(),
        os.arch(),
        'node-modules'
      ].join('-') + '.tar.gz');
  }

  getPath = function(name, version) {
    return getValue(name, (folder ? folder+'/' : '') + packageJSON.name + '/' + version);
  }

  folder = getValue('folder');
  bucket = getValue('bucket', PKG);
  region = getValue('region', 'us-west-2');
  file = getFile('file', packageJSON.version);
  path = getPath('path', packageJSON.version);
  base = getValue('base', 'http://' + bucket + '.s3-website-' + region + '.amazonaws.com');
  url = getValue('url', base + '/' + path + '/' + file);
  latestFile = getFile('latest-file', 'latest');
  latestPath = getPath('latest-path', 'latest');
  latestUrl = getValue('latest-url', base + '/' + latestPath + '/' + latestFile);

  return {
    name: packageJSON.name,
    version: packageJSON.version,
    folder: folder,
    bucket: bucket,
    region: region,
    file: file,
    path: path,
    base: base,
    url: url,
    latestFile: latestFile,
    latestPath: latestPath,
    latestUrl: latestUrl
  }
};
