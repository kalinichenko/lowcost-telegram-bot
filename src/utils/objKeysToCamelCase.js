const { reduce, camelCase } = require("lodash");

const objKeysToCamelCase = obj => {
  return reduce(
    obj,
    (result, value, key) => {
      result[camelCase(key)] = value;
      return result;
    },
    {}
  );
};

module.exports = objKeysToCamelCase;
