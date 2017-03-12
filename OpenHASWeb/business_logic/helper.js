var Helper = function(){

}

Helper.prototype.isNumeric = function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = new Helper()
