const logger = require('../logger');

class Service {
  static rejectResponse(error, code = 500) {
    return { error, code };
  }

  static successResponse(payload, code = 200) {
    return { payload, code};
  }

  static fileResponse(payload, code = 200, type){
    return { payload, code, type};
  }
}

module.exports = Service;
