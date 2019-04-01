const service = require('./VisionService');

service
  .getCoverInfo()
  .then(console.log)
  .catch(console.error);
