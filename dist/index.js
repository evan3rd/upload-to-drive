module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(779);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 42:
/***/ (function(module) {

module.exports = eval("require")("googleapis");


/***/ }),

/***/ 94:
/***/ (function(module) {

module.exports = eval("require")("glob");


/***/ }),

/***/ 141:
/***/ (function(module) {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 412:
/***/ (function(module) {

module.exports = eval("require")("archiver");


/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 779:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const actions = __webpack_require__(141);
const { google } = __webpack_require__(42);
const fs = __webpack_require__(747);
const glob = __webpack_require__(94);
const archiver = __webpack_require__(412);

/** Google Service Account credentials  encoded in base64 */
const credentials = actions.getInput('credentials', { required: true });
/** Google Drive Folder ID to upload the file/folder to */
const folder = actions.getInput('folder', { required: true });
/** Glob pattern for the file(s) to upload */
const target = actions.getInput('target', { required: true });
/** Optional name for the zipped file */
const name = actions.getInput('name', { required: false });
/** Link to the Drive folder */
const link = 'link';
/* Link to file inside of folder */
const fileLink = 'fileLink';

const credentialsJSON = JSON.parse(Buffer.from(credentials, 'base64').toString());
const scopes = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.JWT(credentialsJSON.client_email, null, credentialsJSON.private_key, scopes);
const drive = google.drive({ version: 'v3', auth });

//const driveLink = `https://drive.google.com/drive/folders/${folder}`

async function main() {
//   actions.setOutput(link, driveLink);

//   const targets = glob.sync(target);

//   if (targets.length === 1) {
//     const filename = targets[0].split('/').pop();
//     uploadToDrive(filename, targets[0]);
//   } else {
//     actions.info(`Multiple items detected for glob ${target}`);
//     actions.info('Zipping items...');

//     const filename = `${name}.zip`;

// //     zipItemsByGlob(target, filename)
// //       .then(() => {
// //         action.info('Output to the actions build log ${filename}')
// //         uploadToDrive(name, filename);
// //       })
// //       .catch(e => {
// //         actions.error('Zip failed');
// //         throw e;
// //       });
//   }

    action.info('Output to the actions build log ${filename}')
//     uploadToDrive('README.md', 'README.md');

}

/**
 * Zips files by a glob pattern and stores it in memory
 * @param {string} glob Glob pattern to be matched
 * @param {string} out Name of the resulting zipped file
 */
function zipItemsByGlob(glob, out) {
  const archive = archiver('zip', {zlib: {level: 9}});
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .glob(glob)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => {
      actions.info(`Files successfully zipped: ${archive.pointer()} total bytes written`);
      return resolve();
    });

    archive.finalize();
  });
}

/**
 * Uploads the file to Google Drive
 */
function uploadToDrive(name, path) {
  actions.info('Uploading file to Goole Drive...');
  drive.files.create({
    requestBody: {
      name,
      parents: [folder]
    },
    media: {
      body: fs.createReadStream(path)
    }
  })
  .then(res => {
    actions.setOutput(fileLink, `https://drive.google.com/file/d/${res.data.id}/view?usp=sharing`)
    actions.info('File uploaded successfully')
  })
  .catch(e => {
    actions.error('Upload failed~~~~!!!!!');
    throw e;
  });
}

main().catch(e => actions.setFailed(e));


/***/ })

/******/ });