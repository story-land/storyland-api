require('dotenv').config();
const vision = require('@google-cloud/vision');

module.exports.getCoverInfo = file => {
  const client = new vision.ImageAnnotatorClient();
  return client
    .textDetection(file)
    .then(result => {
      let textDetections = result[0].fullTextAnnotation.text
        .replace(/\n/g, ' ')
        .split(' ');
      return Promise.resolve(textDetections);
    })
    .catch(error => console.log(error));
};
