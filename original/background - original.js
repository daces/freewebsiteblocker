var WebSafe = {
  blockedURLS: {},
  temporaryblockedURLS: [],
  initialiseOnBeforeRequest: function() {
    window.chrome.webRequest.onBeforeRequest.addListener(
        this.beforeRequest,
        {urls: ["http://*/*", "https://*/*"]},
        ['blocking', 'extraHeaders']
    );
  },/*
  isAccessingOwnResources: function(request) {
    var hostname = request.url.match(/(([a-z0-9]+|([a-z0-9]+[-]+[a-z0-9]+))[.])+/)[2];
    return request.initiator.indexOf( hostname ) != -1;
  },
  
  isWhiteListed: function(request) { 
  console.log( 'has property? : ' + Database.hasProperty( WebSafe.hostnameOnly(request) ) )
    return Database.hasProperty( WebSafe.hostnameOnly(request) );
  },*/  
  beforeRequest: function(request) { //console.log(request.type);
    var isMainFrame = request.type === 'main_frame';
    var isNotMainFrame = request.type !== 'main_frame';
    var isNotStyle = request.type !== 'stylesheet';
    var isNotImage = request.type !== 'image';
    var isNotMedia = request.type !== 'media';
        //console.log( request );
      if(isMainFrame || isNotMainFrame ){
        if((WebSafe.isBlackListed(request) && !WebSafe.isInitiatorGoogle(request)) || 
          (WebSafe.isBlackListed(request) && !WebSafe.isInitiatorChrome(request))  ||
          WebSafe.isBlackListed(request)){
          if(isMainFrame){
            WebSafe.removeBrowsingData(request);
            WebSafe.displayBlockedPage(request);
          }
          if(isMainFrame || isNotStyle && isNotImage && isNotMedia){
            WebSafe.setBlocked(request, request.initiator);
            //WebSafe.setBlocked(WebSafe.hostnameOnly(request));
            return WebSafe.blockRequest();
          }
        }
      }
  },  
  
  isBlackListed: function(request) {
    return !Database.isHostAllowed( WebSafe.hostnameOnly(request) );
  },
  
  isInitiatorGoogle: function(request) {
    if(this.hasInitiator(request))
      return request.initiator.indexOf('https://www.google.') !== -1;
  },
  
  isInitiatorChrome: function(request) {
    if(this.hasInitiator(request))
      return request.initiator.indexOf('chrome-extension://') !== -1;
  },
  
  hasInitiator: function(request) {
    return typeof request.initiator !== 'undefined';
  },
  
  removeBrowsingData: function(request) {/*
    chrome.browsingData.removeServiceWorkers({
    "origins": [request.url],
"originTypes": {
          "protectedWeb": true
        }
    }, {
    "cacheStorage": true,
    "cookies": true,
    "fileSystems": true,
    "indexedDB": true,
    "localStorage": true,
    "pluginData": true,
    "serviceWorkers": true,
    "webSQL": true
  }, function (data) {});
 */ },
  
  hostnameOnly: function(request) {
		//console.log(request.url); 
    if(/^((http[s]?|ftp):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,8}(\.[^:\/\s\.]{1,4})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/.test(request.url) === true)
      return request.url.match(/^((http[s]?|ftp):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,8}(\.[^:\/\s\.]{1,4})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/)[4];
    //return request.url.match(/((([a-z0-9]+|([a-z0-9]+[-]+[a-z0-9]+))[.][a-z0-9]+)\/)+/)[2];
  },
  
  displayBlockedPage: function(request) {
    chrome.tabs.update(request.tabId, {url: WebSafe.getExtensionUrl(`blocked.html#${request.url}`)  }) 
  },
  
  getExtensionUrl: function() {
    return window.chrome.extension.getURL.apply(window.chrome.extension, arguments);   
  },  
  
  setBlocked: function(object, initiator) {
    var request = object;
    object = WebSafe.hostnameOnly(object);
    initiator = WebSafe.hostnameOnly({url: initiator});
    if(this.hasInitiator(request)){//console.log(initiator);
      if(typeof this.temporaryblockedURLS[initiator] === 'undefined')
        this.temporaryblockedURLS[initiator] = [];
      if(this.temporaryblockedURLS[initiator].indexOf(object) === -1)
        this.temporaryblockedURLS[initiator].push(object);
    } 
      Database.setBlockedUrl(object);
      this.blockedURLS[object] = 1;

  },
    
  getAlltemporaryblockedURLS: function(url) {
   if(typeof this.temporaryblockedURLS[url] === 'object'){
    return Array.from(this.temporaryblockedURLS[url]);
   }else
     return false;
  },
    
  getAllBlocked: function(object) {
    return this.blockedURLS;
  },
    
  deleteAllBlocked: function() {
    if(this.blockedURLS !== undefined)
      this.blockedURLS = {};
  },
    
  blockRequest: function() {
    return { cancel : true };    
  },
  
};
WebSafe.initialiseOnBeforeRequest();


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender);
	if (request.greeting == "blockedlist"){
    //console.log(request.object[0]);
		sendResponse(WebSafe.getAlltemporaryblockedURLS(request.object[0]));
		//sendResponse(Object.keys(WebSafe.getAllBlocked()));
  }
	if (request.hasOwnProperty('block')){
		delete Database.allowedHosts[request.block];
		Database.removeAllowedHost(request.block);
	}
	sendResponse({});
	return true;
});
  
chrome.webNavigation.onDOMContentLoaded.addListener(function(tab){
 // WebSafe.deleteAllBlocked();  
});