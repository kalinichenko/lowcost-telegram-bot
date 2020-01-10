import { reduce, camelCase } from "lodash";

export default obj => {
  return reduce(
    obj,
    (result, value, key) => {
      result[camelCase(key)] = value;
      return result;
    },
    {}
  );
};
