"use strict"
var PopUp = (function(){
  var elementListAllow = document.getElementById('list__allow');
  var elementListBlock = document.getElementById('list__block');
  var elementMenuButtonAllowed = document.querySelector('.menu__button-allowed');
  var elementMenuButtonBlocked = document.querySelector('.menu__button-blocked');
  var protectionText = document.querySelector('.protection-text');
  var is_checked = document.getElementById("cbox")
  
  elementMenuButtonAllowed.focus();
  
  var host;
  var enabled_status;
  function init(){
    elementListAllow.innerHTML = "";
    elementListBlock.innerHTML = "";

    chrome.runtime.sendMessage({msg: "WebSafe_Get_Extension_Status", host}, function(response) {
      enabled_status = response;
      is_checked.checked = enabled_status; 
      
      if( is_checked.checked == true ){
        protectionText.textContent  = "Protection is enabled";
      }
      if( is_checked.checked == false ){
        protectionText.textContent  = "Protection is disabled";
      }
      return true;
    });
    
    chrome.tabs.query({active: true}, function (tab){
      var isNotChromeExtension = tab[0].url.indexOf('chrome://extensions/') === -1;
      if(isNotChromeExtension){
        host = Components.getHostNameOnly(tab[0].url);
        console.log(host);
        chrome.runtime.sendMessage({msg: "WebSafe_Get_Temp_Blocked_Requests", host}, function(response) {
          getUrlsFromBackgoundPage(response, 'blocked');
          return true;
        });
        chrome.runtime.sendMessage({msg: "WebSafe_Get_Allowed_Requests", host}, function(response) {
          getUrlsFromBackgoundPage(response, 'allowed');
          return true;
        });
      }
      return true;
    });
  }
  var main_switch = document.getElementById("main-switch")
  main_switch.addEventListener('click', function(event) {
    console.log( "clicked ")
      if( is_checked.checked == true ){
        is_checked.checked = false;
        chrome.runtime.sendMessage({msg: "WebSafe_Set_Extension_Status", status: false});
        protectionText.textContent  = "Protection is disabled";
        return true;
      }
      if( is_checked.checked == false ){
        is_checked.checked = true;
        chrome.runtime.sendMessage({msg: "WebSafe_Set_Extension_Status", status: true});
        protectionText.textContent  = "Protection is enabled";
        return true;
      }
  });
 
  elementListAllow.addEventListener('click', function(event) {
    var element = event.target;
    var url = element.textContent;
      if(isList(element)){
       // if(urlNotInDatabase(url)){
         //TODO
        //WebSafeDatabase.addAllowedHost(assignObject(url))
        console.log( "Allow page: ", host, " -  request:", url)
        if( host == url ){
          chrome.runtime.sendMessage({msg: "WebSafe_Allow_Page", page: host});
        }
        else {
          chrome.runtime.sendMessage({msg: "WebSafe_Allow_Request", page: host, request: url})
          chrome.runtime.sendMessage({msg: "WebSafe_Remove_TempBlocked_Requests", initiator: host, hostname: url})
        }
        removeElement(element);
        //}
      }
      init();
  });
  
  elementListBlock.addEventListener('click', function(event) {
    var element = event.target;
    var url = element.textContent;
      if(isList(element)){
        console.log( "Block page: ", host, " -  request:", url)
        if( host == url ){
          chrome.runtime.sendMessage({msg: "WebSafe_Remove_Allowed_Page", page: host});
        }
        else {
          chrome.runtime.sendMessage({msg: "WebSafe_Remove_Allowed_Request", page: host, request: url})
          chrome.runtime.sendMessage({msg: "WebSafe_Remove_TempBlocked_Requests", initiator: host, hostname: url})
        }
        removeElement(element);
      }
      init();
  });
        
  function removeElement(element){
    element.parentElement.removeChild(element);
  }
  
  elementMenuButtonAllowed.addEventListener('click', function(event) {
    //ga('send', 'event', event.target.id, 'Clicked', 'Button');
    listToggleHidden();
    buttonToggleColor();
  });
  
  elementMenuButtonBlocked.addEventListener('click', function(event) {
    //ga('send', 'event', event.target.id, 'Clicked', 'Button');
    listToggleHidden();
    buttonToggleColor();
  });
  
  function getUrlsFromBackgoundPage(message, status){
    if(message){ console.log(message);
      message.forEach(function(url){
       // if(urlNotInDatabase(url))
        if( typeof url == "string" )
          markup(url, status);
      });
    }
    return true;
  }
  
  function markup(url, status){
    var markup = `<li>${url}</li>`;
    if(status == 'blocked'){
     elementListAllow.insertAdjacentHTML('afterbegin', markup);
    }
    if(status === 'allowed')
     elementListBlock.insertAdjacentHTML('afterbegin', markup);
  }
  
  function isList(element){
    return element.tagName === 'LI';
  }
  
  function urlNotInDatabase(url){
    return WebSafeDatabase.isHostBlocked(url);
  }
      
  function assignObject(url){
    var host = {};
    host[url] = 1;
    return host;
  }

  function listToggleHidden(){
    elementListAllow.classList.toggle('hidden');
    elementListBlock.classList.toggle('hidden');
  }
      
  function buttonToggleColor(){
    elementMenuButtonAllowed.classList.toggle('color-red');
    elementMenuButtonBlocked.classList.toggle('color-green');
  }
  try{
    calltoAction();
  }
  catch(e){}
  
var public_api = {
  init
};

return public_api;
})();

window.addEventListener('DOMContentLoaded', function () {
  PopUp.init();

});

/*
function trackExeption(error, fatal){
  ga('send', 'event', {'exDescription': error,'exFatal': fatal});
  //ga('send', 'exception', {'exDescription': error,'exFatal': fatal});
}

function error(e){
  trackExeption(e.error);
}

window.addEventListener("error", error, true);*/