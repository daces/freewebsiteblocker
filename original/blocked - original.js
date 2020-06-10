window.addEventListener('DOMContentLoaded', function () {
   var isHashPresent = window.location.hash !== 'null';
    if ( isHashPresent ) {
      var locationHashValue = window.location.hash.replace('#', '');  
        setInpputValue(locationHashValue);  
        setButtonSearchHref(GoogleSeachAndHostName());
    }
    
  function GoogleSeachAndHostName() {
    var googleSearchQuery = 'https://www.google.com/search?safe=strict&q=';
      return `${googleSearchQuery}${getHostNameOnly()}`;
  }
  
  function setButtonSearchHref(query) {
      getButtonSearch().href = query;
  }
    
  function getHostNameOnly() {
    var url = getInpputValue().value;
		console.log(url);
    return url.match(/^((http[s]?|ftp):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,8}(\.[^:\/\s\.]{1,4})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/)[4];
    //return url.match(/((([a-z0-9]+|([a-z0-9]+[-]+[a-z0-9]+))[.][a-z0-9]+)\/)+/)[2];
  }
  
  function getInpputValue() {
    return document.querySelector('.holder__input-blocked');  
  }
  
  function getButtonSearch() {
    return document.querySelector('.holder__button-deny');
  }
    
  function setInpputValue(text) {
    document.querySelector('.holder__input-blocked').value = text;
  }

  function getButtonAllow() {
    return document.querySelector('.holder__button-allow');
  }

  function isHostAllowed() {
    return Database.isHostAllowed( getHostNameOnly() );
  }

  function isBlackListed() {
    return Database.isBlackListed( getHostNameOnly() );
  }
  
  function changeWindowLocation(url) {
     window.location = url;
    window.location.assign(url);
    return true;
  }
  
  function assignObject(object) { console.log( 'this is boject', object );
    object[getHostNameOnly()] = 1;
    return  object ;
  }
  
  getButtonAllow().addEventListener('click', function(event) { console.log( 'Click event initialised' );
    var hostObject = new Object();
    var url = getInpputValue().value;
    /*if( isBlackListed() )
      Database.removeUrlFromLocalStorage(getHostNameOnly());
    if( isHostAllowed() )
      changeWindowLocation( getInpputValue().value );
    else {
      Database.allowOneHost(assignObject(hostObject));
      //changeWindowLocation( getInpputValue().value );
    }*/
      Database.removeUrlFromLocalStorage(getHostNameOnly());
      Database.allowOneHost(assignObject(hostObject));
      window.location.assign(url);
      
      console.log( url  )
  });
 /* 
  window.addEventListener('hashchange', function (event) {
  var isHashPresent = window.location.hash !== 'null';
    if ( isHashPresent ) {
      var locationHashValue = window.location.hash.replace('#', '');  
        setInpputValue(locationHashValue);  
        setButtonSearchHref(GoogleSeachAndHostName());
    }
    });*/
});