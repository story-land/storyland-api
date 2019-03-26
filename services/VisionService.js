require('dotenv').config();
const vision = require('@google-cloud/vision');

module.exports.getCoverInfo = file => {
  const client = new vision.ImageAnnotatorClient();
  const fileName = __dirname + '/padre.jpg';
  return client
    .textDetection(fileName)
    .then(result => {
      let detections = result[0].fullTextAnnotation.text;
      return Promise.resolve(detections);
    })
    .catch(error => console.log(error));
};
