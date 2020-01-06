module.exports = function btoa(b) {
  return Buffer.from(b).toString('base64');
};
