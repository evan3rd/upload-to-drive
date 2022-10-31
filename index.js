const actions = require('@actions/core');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const glob = require('glob');
//const archiver = require('archiver');

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

const driveLink = `https://drive.google.com/drive/folders/${folder}`

async function getJWT() {
  const client = new JWT({
    email: credentialsJSON.client_email,
    key: credentialsJSON.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const url = `https://dns.googleapis.com/dns/v1/projects/${credentialsJSON.project_id}`;
  const res = await client.request({url});
  console.log(res.data);
}

async function main() {
  actions.setOutput(link, driveLink);

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

    //uploadToDrive('README.md', 'README.md');


    console.log(target);
    console.log(driveLink);
    //console.log(auth);
    //console.log(drive);
    //console.log(credentialsJSON);
    //listFiles();
    searchFile();

    //const fi = fs.createReadStream('./README.md')
    //console.log(fi)

    var data = fs.readFileSync(target);
    console.log(data.toString());

    getJWT();
}

/**
 * Zips files by a glob pattern and stores it in memory
 * @param {string} glob Glob pattern to be matched
 * @param {string} out Name of the resulting zipped file
 */
// function zipItemsByGlob(glob, out) {
//   const archive = archiver('zip', {zlib: {level: 9}});
//   const stream = fs.createWriteStream(out);

//   return new Promise((resolve, reject) => {
//     archive
//       .glob(glob)
//       .on('error', err => reject(err))
//       .pipe(stream);

//     stream.on('close', () => {
//       actions.info(`Files successfully zipped: ${archive.pointer()} total bytes written`);
//       return resolve();
//     });

//     archive.finalize();
//   });
// }

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

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles() {
  //const drive = google.drive({version: 'v3', auth: authClient});
  const res = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });
  const files = res.data.files;
  if (files.length === 0) {
    console.log('No files found.');
    return;
  }

  console.log('Files:');
  files.map((file) => {
    console.log(`${file.name} (${file.id})`);
  });
}

/**
 * Search file in drive location
 * @return{obj} data file
 * */
async function searchFile() {
  const files = [];
  try {
    const res = await drive.files.list({
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive'
    });
    Array.prototype.push.apply(files, res.files);
    res.data.files.forEach(function(file) {
      console.log('Found file:', file.name, file.id);
    });

    console.log(res.data.files);

    return res.data.files;
  } catch (err) {
    console.log('No files found..');
    throw err;
  }
}

main().catch(e => actions.setFailed(e));
