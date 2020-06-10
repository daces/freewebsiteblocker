"use strict"
var WebSafeBlockedPage = (function(){
  var url;
  function init(){
  url = getInpputValue().value;
   var isHashPresent = window.location.hash != 'null';
   console.log( window.location.hash );
   console.log( url );
    if ( isHashPresent ) {
      var locationHashValue = window.location.hash.replace(/(.+\#|#)((h.+)|(f.+))/, '$2');  
      
        setInpputValue(locationHashValue);  
        setButtonSearchHref(getGoogleSeachAndHostName());
    }
  }
    
  function getGoogleSeachAndHostName() {
    var googleSearchQuery = 'https://www.google.com/search?safe=strict&q=';
      return `${googleSearchQuery}${Components.getHostNameOnly(url)}`;
  }
  
  function setButtonSearchHref(query) {
      getButtonSearch().href = query;
  }
  
  function getButtonSearch() {
    return document.querySelector('.holder__button-deny');
  }
  
  function getInpputValue() {
    return document.querySelector('.holder__input-blocked');  
  }
  
  function setInpputValue(text) {
    document.querySelector('.holder__input-blocked').value = text;
  }

  function assignObject(object) { 
    object[Components.getHostNameOnly(url)] = 2;      console.log( 'this is boject', object );
    return  object ;
  }

  function getButtonAllow() {
    return document.querySelector('.holder__button-allow');
  }
  
  getButtonAllow().addEventListener('click', function(event) { console.log( 'Click event initialised' );
    var hostObject = {};
    url = getInpputValue().value;
      chrome.runtime.sendMessage({msg: "WebSafe_Allow_Page", page: Components.getHostNameOnly(url)}, function(response) {
          console.log( 'message delivered successfuly.' );
      });
      setTimeout(function(){
        changeWindowLocation(url);
      }, 200);
  });  
  
  function changeWindowLocation(url) {
    return location.assign(url);
  }
  
  var publc_api = {
    init: init,
    setInpputValue: setInpputValue ,
    setButtonSearchHref: setButtonSearchHref
  }
  
  return publc_api;
})();

window.addEventListener('hashchange', function () {
  WebSafeBlockedPage.init();
});
window.addEventListener('DOMContentLoaded', function () {
  WebSafeBlockedPage.init();
});
/*
function trackExeption(error, fatal){
  //ga('send', 'exception', {'exDescription': error.message,'exFatal': fatal});
}

function error(e){
  trackExeption(e.error);
}

window.addEventListener("error", error, true);*/