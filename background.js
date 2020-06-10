"use strict"
window.addEventListener("error", trackExeption, true);
function trackExeption(error, fatal){
  //ga('send', 'exception', {'exDescription': error.message,'exFatal': fatal});
  //ga('send', 'event', {'exDescription': error,'exFatal': fatal});
  console.log( error, websafeLogInfo );
}
window.onerror = function(message, url, line, col, error){
  trackExeption({message, url, line, col, error});
}


var WebSafe = (function(){
  var web_page;
  var extension_etatus = true;
  var exclude_list_etatus = true;
  
  function getExtensionStatus(){
    return extension_etatus;
  }
  
  function setExtensionStatus(newStatus){
    extension_etatus = newStatus;
  }
  
  function getExcludeListStatus(){
    return exclude_list_etatus;
  }
  
  function setExcludeListStatus(newStatus){
    exclude_list_etatus = newStatus;
  }
  
  function setWebLocation(location){
    web_page = location;
  }
  
  function getWebLocation(location){
    return web_page;
  }
  function beforeRequest(request){
   /* console.log( "web_page: ", web_page );
    console.log( "initiator: ", request.initiator );
    console.log( "url: ", Components.getHostNameOnly( request.url ));*/
    var isMainFrame = request.type === 'main_frame';
    var isNotMainFrame = request.type !== 'main_frame';
    var isStyle = request.type == 'stylesheet';
    var isNotStyle = request.type !== 'stylesheet';
    var isImage = request.type == 'image';
    var isNotImage = request.type !== 'image';
    var isNotMedia = request.type !== 'media';
    var url = Components.getHostNameOnly( request.url );
   //console.log( "url: ", url, "-", web_page, " -", request);
    if( extension_etatus == false ){
      return allowRequest();
    }
    if( exclude_list_etatus == true ){
      if( WebSafeDatabase.getExcludeList().includes( Components.getHostOnly( url ) ) == true ){
        return allowRequest();
      }
    }
    if( url == web_page ) {
      web_page = url;
    }
    if( hasInitiator( request.initiator )){
      var initiator = Components.getHostNameOnly( request.initiator );
    }
    if( web_page != "chrome-extension:" &&
        web_page != "chrome://newtab/" &&
        web_page != "chrome:" &&
        web_page != "" &&
        web_page != undefined ){
      if( isStyle ) {
        return allowRequest();
      }
      if( isMainFrame && WebSafeDatabase.isPageBlocked( url ) ){
        displayBlockedPage( request );
      }
      else if ( isMainFrame && !WebSafeDatabase.isPageBlocked( url ) ){
        return allowRequest();
      }
      else {
      //if(  WebSafeDatabase.isPageBlocked( url ) ){
        if( WebSafeDatabase.isOnlyRequestBlocked(web_page, url) ){
          if( WebSafeDatabase.isPageBlocked( web_page )  ){
            chrome.tabs.query({status: "loading"}, function(tab){
              try {
                //console.log( tab[0].url );
                displayBlockedPage( {tabId: tab[0].id, url: tab[0].url} );
              }
              catch(e){}
            });
          }

          if( hasInitiator(initiator) == true){
                //console.log( "has initiator", (initiator) )
                //console.log( "request", (request.type) )
            chrome.tabs.query({active: true}, function(tab){
              //console.log( "request", request.tabId ," = ", tab[0].id  )
              console.log( "request", request.tabId ," = ", tab[0].id  )
              if ( request.tabId == tab[0].id ) {//|| request.tabId == -1 ){
                WebSafeDatabase.setTempBlockedHosts(web_page, url);  
                WebSafeBadge.setBadgeText(web_page);
              }
              if ( request.tabId == -1 ){
                WebSafeDatabase.setTempBlockedHosts(initiator, url);  
                WebSafeBadge.setBadgeText(initiator);
              }
              else {
                WebSafeDatabase.setTempBlockedHosts(initiator, url);  
                //WebSafeBadge.setBadgeText(web_page);
              }
            });
          }
          return blockRequest();
        }
        
      }
      //WebSafeDatabase.allowRequest( web_page, url );
    }
    if( isMainFrame && WebSafeDatabase.isPageBlocked( url ) && web_page != undefined){
      displayBlockedPage( request );
    }
  }

  function displayBlockedPage( request ) {
    try {
      chrome.tabs.update(request.tabId, {url: getExtensionUrl(`blocked.html#${request.url}`)  },function(tab){
        if(chrome.runtime.lastError)
          return
      });
      return true;
    }
    catch (e) {}
  }
  
  function hasInitiator(initiator){
    if( initiator == false )
      return false;
    if( typeof initiator == undefined )
      return false;
    return true;
  }
  
  function getExtensionUrl() {
    return window.chrome.extension.getURL.apply(window.chrome.extension, arguments);   
  } 
    
  function blockRequest() {
    return { cancel : true };    
  }
  
  function allowRequest() {
    return { cancel : false };    
  }
  
var public_api = {
  setExtensionStatus: setExtensionStatus,
  getExtensionStatus: getExtensionStatus,
  beforeRequest: beforeRequest,
  setWebLocation: setWebLocation,
  getWebLocation: getWebLocation
};

return public_api;
})();

window.chrome.webRequest.onBeforeRequest.addListener(
    WebSafe.beforeRequest,
    {urls: ["http://*/*", "https://*/*"]},
    ['blocking']
);

function refreshPageCleanCache(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if( tabs[0].hasOwnProperty("url") == true )
    if( tabs[0].url.indexOf("chrome-extension") == -1)
      chrome.tabs.reload(tabs[0].id, {bypassCache: true});
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch ( request.msg ){
    case "WebSafe_Get_Temp_Blocked_Requests" : 
      sendResponse( WebSafeDatabase.getTempBlockedHosts( request.host ) );
      break;
    case "WebSafe_Get_Allowed_Requests" : 
      sendResponse( WebSafeDatabase.getAllowedRequests( request.host ) );
      break;
    case "WebSafe_Remove_Allowed_Requests" : 
      WebSafeDatabase.removeTempAllowedHost( request.initiator, request.hostname );
      break;
    case "WebSafe_Remove_TempBlocked_Requests" : 
      WebSafeDatabase.removeTempBlockedHost( request.initiator, request.hostname );
      break;
    case "WebSafe_Allow_Page" : 
      WebSafeDatabase.addAllowedPage( request.page );
      WebSafeDatabase.setStorage();
      break;
    case "WebSafe_Allow_Request" : 
      WebSafeDatabase.addAllowedRequest( request.page, request.request );
      refreshPageCleanCache();
      WebSafeDatabase.setStorage();
      break;
    case "WebSafe_Remove_Allowed_Request" : 
      WebSafeDatabase.removeAllowedRequest( request.page, request.request );
      refreshPageCleanCache();
      WebSafeDatabase.setStorage();
      break;
    case "WebSafe_Remove_Allowed_Page" : 
      WebSafeDatabase.removeAllowedPage( request.page );
      refreshPageCleanCache();
      WebSafeDatabase.setStorage();
      break;
    case "WebSafe_Get_Extension_Status" : 
      sendResponse( WebSafe.getExtensionStatus() );
      break;
    case "WebSafe_Set_Extension_Status" : 
      WebSafe.setExtensionStatus( request.status );
      break;
    case "WebSafe_Get_Exclude_List" : 
      sendResponse( WebSafeDatabase.getExcludeList() );
      break;
    case "WebSafe_Set_Exclude_List" : 
      WebSafeDatabase.setExcludeList( request.list );
      WebSafeDatabase.setStorage();
      break;
  }
	sendResponse({});
	return true;
});

var WebSafeBadge = (function(){

  function setBadgeText(page){
    if( isNOTUndefined( page ) && page.indexOf(":") == -1 ){
      //console.log( "page:", page, " web_page ", WebSafe.getWebLocation())
      if( page == WebSafe.getWebLocation() ){
        var numberOfBlockedHosts = WebSafeDatabase.getNumberOfTempBlocked(page)
        chrome.browserAction.setBadgeText({text: String(numberOfBlockedHosts)});
      }
    }
    if( page == "" ){
      chrome.browserAction.setBadgeText({text: ""});
    }
  }
    chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});

  function isNOTUndefined( variable ){
    return typeof variable != "undefined"
  }
  
  return {
    setBadgeText
  };
  
})();

chrome.tabs.onUpdated.addListener(function(tabId,tab){
  if( tab.hasOwnProperty("url") == true ){
    WebSafe.setWebLocation( Components.getHostNameOnly( tab.url ) );
   /* if( WebSafeDatabase.isPageNew(initiator) )
      WebSafeDatabase.removeAllowedPage(initiator);  */
  }
  if( tab.hasOwnProperty("status") == true )
    WebSafeBadge.setBadgeText( WebSafe.getWebLocation() );
});

chrome.webNavigation.onCompleted.addListener(function (tab){
  //console.log("navigation", tab);
  WebSafeBadge.setBadgeText(  Components.getHostNameOnly( tab.url ) );
});

chrome.tabs.onActivated.addListener(function (){
  WebSafeBadge.setBadgeText( "" );
  chrome.tabs.query({active: true}, function(tab){
    WebSafe.setWebLocation( Components.getHostNameOnly( tab[0].url ) );

   WebSafeBadge.setBadgeText( Components.getHostNameOnly( tab[0].url ) );
  });
});

chrome.contextMenus.create({id: "websafewaudiawndiawn9821n9d", title: "Unblock", contexts: ["all"]})
chrome.contextMenus.onClicked.addListener(  function( variable,tab ){
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, { msg: "websafeblockElementOnPage" });
  });
});
/*
chrome.privacy.websites.doNotTrackEnabled.get({}, function(details) {
  console.log("meh");
  if (details.levelOfControl === 'controllable_by_this_extension') {
    chrome.privacy.websites.doNotTrackEnabled.set({ value: true }, function() {
      if (chrome.runtime.lastError === undefined)
        console.log("Hooray, it worked!");
      else
        console.log("Sadness!", chrome.runtime.lastError);
    });
  }
});*/