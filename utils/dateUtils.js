var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;
var day = date.getDate();
var Hours = date.getHours();
var Minutes = date.getMinutes();
var Seconds = date.getSeconds();
var millSec = date.getMilliseconds();
if (month < 10) {
      month = "0" + month;
}
if (day < 10) {
      day = "0" + day;
}
if(Hours < 10) {
      Hours = '0' + Hours;
}
if(Minutes < 10) {
      Minutes = '0' + Minutes;
}
if(Seconds < 10) {
      Seconds = '0' + Seconds;
}
if (millSec < 10) {
      millSec = '00' + millSec;
} else if (millSec < 100) {
      millSec = '0' + millSec;
}

var createdAt = year + '-' + month + '-' + day + ' ' + Hours + ':' + Minutes + ':' + Seconds + ':' + millSec;
module.exports = createdAt