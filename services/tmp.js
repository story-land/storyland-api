const service = require('./vision.service');

service
  .getCoverInfo()
  .then(console.log)
  .catch(console.error);
