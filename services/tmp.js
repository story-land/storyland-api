const service = require('./visionService');

service
  .getCoverInfo()
  .then(console.log)
  .catch(console.error);
