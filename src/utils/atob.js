module.exports = function atob(a) {
  return Buffer.from(a, 'base64').toString('binary');
};