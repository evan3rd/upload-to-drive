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
const scopes = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file'];
//const auth = new google.auth.JWT(credentialsJSON.client_email, null, credentialsJSON.private_key, scopes);
// const auth = new JWT({
//     email: credentialsJSON.client_email,
//     key: credentialsJSON.private_key,
//     scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/cloud-platform'],
//   });
//const drive = google.drive({ version: 'v3', auth });

const driveLink = `https://drive.google.com/drive/folders/${folder}`

const auth = google.auth.fromJSON(credentialsJSON);

/**
 * Insert new file.
 * @return{obj} file Id
 * */
async function uploadBasic() {
  const {GoogleAuth} = require('google-auth-library');

  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app
  const _auth = new GoogleAuth({
    email: credentialsJSON.client_email,
    key: credentialsJSON.private_key,
    scopes: 'https://www.googleapis.com/auth/drive',
  });
  const service = google.drive({version: 'v3', _auth});
  const fileMetadata = {
    name: 'README.md',
  };
  const media = {
    body: fs.createReadStream('README.md'),
  };
  try {
    const file = await service.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log('File Id:', file.data.id);
    return file.data.id;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

async function getJWT() {
  const client = new JWT({
    email: credentialsJSON.client_email,
    key: credentialsJSON.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/cloud-platform'],
  });
  //const url = `https://dns.googleapis.com/dns/v1/projects/${credentialsJSON.project_id}`;
  //const url = 'https://www.googleapis.com/drive/v3/files';
  const url = 'https://drive.google.com/drive/folders/16EJugWes0dj5fBodq38Hs0vdL0cYkunC';
  //const res = await client.request({url});
  //console.log(res.data);

  // var res = await new JWT({
  //   email: credentialsJSON.client_email,
  //   key: credentialsJSON.private_key,
  //   scopes: ['https://www.googleapis.com/auth/drive.file'],
  // });

  // console.log(res);

  const _drive = await google.drive({ version: 'v3', client });

  const files = [];
  try {
    const res = await _drive.files.list({
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

    auth.scopes = scopes
    var drive = google.drive({ version: 'v3', auth });

    console.log("Hello~~")

    //console.log(target);
    console.log(driveLink);
    console.log(auth);
    console.log(drive);
    console.log(credentialsJSON);
    //listFiles();
    //searchFile();

    //const fi = fs.createReadStream('./README.md')
    //console.log(fi)

    //var data = fs.readFileSync(target);
    //console.log(data.toString());

    //getJWT();

    //uploadBasic();

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


// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const {authenticate} = require('@google-cloud/local-auth');
// const {google} = require('googleapis');

// const actions = require('@actions/core');
// const input_credentials = actions.getInput('credentials', { required: true });
// const credentialsJSON = JSON.parse(Buffer.from(input_credentials, 'base64').toString());

// // If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// // The file token.json stores the user's access and refresh tokens, and is
// // created automatically when the authorization flow completes for the first
// // time.
// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// /**
//  * Reads previously authorized credentials from the save file.
//  *
//  * @return {Promise<OAuth2Client|null>}
//  */
// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// /**
//  * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
//  *
//  * @param {OAuth2Client} client
//  * @return {Promise<void>}
//  */
// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// /**
//  * Load or request or authorization to call APIs.
//  *
//  */
// async function authorize() {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }
//   client = await authenticate({
//     scopes: SCOPES,
//     keyfilePath: CREDENTIALS_PATH,
//   });
//   if (client.credentials) {
//     await saveCredentials(client);
//   }
//   return client;
// }

// /**
//  * Lists the names and IDs of up to 10 files.
//  * @param {OAuth2Client} authClient An authorized OAuth2 client.
//  */
// async function listFiles(authClient) {
//   const drive = google.drive({version: 'v3', auth: authClient});
//   const res = await drive.files.list({
//     pageSize: 10,
//     fields: 'nextPageToken, files(id, name)',
//   });
//   const files = res.data.files;
//   if (files.length === 0) {
//     console.log('No files found.');
//     return;
//   }

//   console.log('Files:');
//   files.map((file) => {
//     console.log(`${file.name} (${file.id})`);
//   });
// }

// authorize().then(listFiles).catch(console.error);