"use strict"
const Components = (function(){
  
  function getHostNameOnly(url) {
    if( url == undefined )
      return false;
    if(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)|((?!w*\.|[http?s|ftp]*[:\/\/])([^\/"]*|\w*\:))/.test(url) === true)
      return url.match(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)|((?!w*\.|[http?s|ftp]*[:\/\/])([^\/"]*|\w*\:))/)[0];
  }  
  function getHostOnly(url) {
    if( url == undefined )
      return false;
    if(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)|[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/.test(url) === true)
      return url.match(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)|[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/)[0];
    //\.(?(?=(\.{2}))(\w.*?)|(\w.*?)\/)
    //(\w*\:\/\/)?(?(1)(.*?)|[a-zA-Z0-9_-]*\.\w*)\/
  }
  //((?!w*\.|[http?s|ftp]*[:\/\/])(\w*\.\w+\/|\w*\.\w+$))
  var public_api = Object.freeze({
    getHostNameOnly,
    getHostOnly
  });
  
  return public_api;
})();