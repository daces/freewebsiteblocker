"use strict"
const win_document = window.document;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.msg == "websafeblockElementOnPage"){
    WebSafeUnblockElements.addEventListeners();
		sendResponse({});
  }
	sendResponse({});
	return true;
});

var WebSafeUnblockElements = (function(){
  var elementToOverlay = null;
  window.allowSelectElement = true;
  var overlayStyle = win_document.createElement('style');
  overlayStyle.textContent = '#websafe-element-overlay{all: unset; position: absolute !important; z-index: 2147483646 !important; display: none !important; background-color: rgba(0,155,255,0.3) !important; border: solid 1px rgb(0,155,255) !important; transition-duration: 200ms !important;}';
  overlayStyle.textContent += '.websafe-element-overlay-standard::before{all: unset; content: "Click to unblock this resource";position: absolute;font-family: "Roboto";left: 50%;transform: translateX(-50%);font-size:13px;text-align: center;width: 170px;height: 20px;line-height: 20px;border-radius: 5px;background-color: rgb(0,155,255);color: rgb(245,245,245);top: -30px;box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.5);}';
  overlayStyle.textContent += '.websafe-element-overlay-standard::after{all: unset; content: "▾";font-family: "Roboto";color: rgb(0,155,255);left: 0px;right: 0px;margin: 0 auto;width: 20px;position: absolute;top: -22px;font-size: 25px;line-height: 28px;text-shadow: 0px 1px 1px rgba(0,0,0,0.5);}';
  win_document.documentElement.appendChild(overlayStyle);
  var overlayElement = win_document.createElement('div');
  overlayElement.id = 'websafe-element-overlay';
  win_document.documentElement.appendChild(overlayElement);
  
  function addEventListeners(){
    win_document.addEventListener("mouseover", onMouseMove);
    win_document.addEventListener("mouseout", onMouseLeave);
    win_document.addEventListener('mousedown', onMouseClick, true);
  }   
  
  function removeEventListeners(){
    win_document.removeEventListener("mouseover", onMouseMove);
    win_document.removeEventListener("mouseout", onMouseLeave);
    win_document.removeEventListener('mousedown', onMouseClick, true);
  }

  function onMouseMove(event) {
    if (window.allowSelectElement) {
      var elements = win_document.elementsFromPoint(event.x, event.y);
      var target = elements.length == 0 ? null : elements[0] == overlayElement ? elements[1] : elements[0];
      if (target && isSelectableElement(target) == false)
        target = null;

      if (!target) {
        deselectElementToOverlay();
      } else if (target != overlayElement && target != elementToOverlay) {
        elementToOverlay = target;
        
        overlayElement.setAttribute('class', 'websafe-element-overlay-standard');

        var position = getElementPosition(elementToOverlay);
        updateOverlayPosition(position.x, position.y, elementToOverlay.clientWidth, elementToOverlay.clientHeight, true);
      }
    }
  }
  
  function onMouseLeave() {
    deselectElementToOverlay();
  }

  function onMouseClick(event) {
    event.preventDefault();
    if( isLeftButtonClick(event) ) { 
      var blocked_src ;
      console.log("target",  elementToOverlay)
      
      if( Object.is(elementToOverlay, null )){
        console.log( "NULL", elementToOverlay) 
        deselectElementToOverlay();
        removeEventListeners();
        return false;
      }        
      if( elementToOverlay.tagName == "IMG" )
        blocked_src = Components.getHostNameOnly( elementToOverlay.src );       
      if( elementToOverlay.tagName == "IMAGE" )
        blocked_src = Components.getHostNameOnly( elementToOverlay.src );
      if( elementToOverlay.tagName == "IFRAME"  )
        blocked_src = Components.getHostNameOnly( elementToOverlay.src );
      Array.from(elementToOverlay.children).filter(function(element, index){
        if( element.tagName == "IMG" )
          blocked_src = Components.getHostNameOnly( element.src );
        if( element.tagName == "IMAGE" )
          blocked_src = Components.getHostNameOnly( element.src );
      })
      
      if( blocked_src != undefined && blocked_src != "")
        console.log("blocked_src", blocked_src )
       // runtimeSendMessage( assignObject( blocked_src ))
    }
    deselectElementToOverlay();
    removeEventListeners();
  }

  function assignObject(url) { 
    var object = new Object();
    object[Components.getHostNameOnly(url)] = 2;      console.log( 'this is boject', object );
    return  object ;
  }
  
  function isLeftButtonClick(event) {
    return event.button === 0;
  }
  
  function runtimeSendMessage(host) { 
    console.log( host);
        chrome.runtime.sendMessage({msg: "WebSafe_Allow_Page", host}, function(response) {
          //if( response.farewell === "goodbye" )
            console.log( 'message delivered successfuly.' );
            
        });
  }
  
  function updateOverlayPosition(left, top, width, height, visible) {
    overlayElement.style.setProperty('left', (left - 1) + 'px', 'important');
    overlayElement.style.setProperty('top', (top - 1) + 'px', 'important');
    overlayElement.style.setProperty('width', width + 'px', 'important');
    overlayElement.style.setProperty('height', height + 'px', 'important');
    overlayElement.style.setProperty('display', visible ? 'block' : 'none', 'important');
  }
  
  function deselectElementToOverlay() {
    if (window.allowSelectElement && elementToOverlay) {
        elementToOverlay && updateOverlayPosition(0, 0, 0, 0, false);
        elementToOverlay = null;
    }
  }
  
  function getElementPosition(elem) {
      var rect = elem.getBoundingClientRect();
      var top  = rect.top + window.pageYOffset;//win_document.body.scrollTop;
      var left = rect.left + window.pageXOffset;//win_document.body.scrollLeft;

      return { x: left, y: top };
  }
  
  function isSelectableElement(element) {
    var srcElements = ["LINK","A","SOURCE","IMG", "IMAGE", "PICTURE", "IFRAME","EMBED","VIDEO","AUDIO","TRACK","MAP", "YT-IMG-SHADOW"];
      if ( srcElements.indexOf(element.tagName) == -1 )
          return false;

      if (element.tagName == 'IFRAME' && element.id  == 0)
          return true;

      var isStandsObject = function(object) {
/*          if (object.id && object.id.indexOf('websafe') > -1)
              return true;

          var elementClass = object.getAttribute('class');
          if (elementClass && elementClass.indexOf('websafe') > -1)
              return true;
*/
          return false;
      };

      if (isStandsObject(element) || isStandsObject(element.parentElement) || isStandsObject(element.parentElement.parentElement))
          return false;

      if (element.clientWidth * element.clientHeight < 100)
          return false;

      if (window.top == window) {
          var parentElement = element.parentElement;
          while (parentElement != win_document.body) {

              parentElement = parentElement.parentElement;
          }
      }

      var isDocumentSize = (element.offsetWidth >= win_document.documentElement.offsetWidth - 5 && element.offsetHeight >= win_document.documentElement.offsetHeight - 5) ||
          (element.offsetWidth >= win_document.documentElement.clientWidth - 5 && element.offsetHeight >= win_document.documentElement.clientHeight - 5);
      return isDocumentSize == false;
  }

  var public_api = Object.freeze({
    addEventListeners: addEventListeners,
    elementToOverlay: elementToOverlay
  });
  
  return public_api;
})();
