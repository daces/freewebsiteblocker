var Database = {
  storage: chrome.storage.local,
  allowedHosts: new Object(),
  
  init: function() {
    this.updateallowedHosts();
  },
  
  getAllItemsFromStorage: function() {
    var newUrls = {}
    this.storage.get(null, function(items) {
     Database.allowedHosts  = items;//Object.assign(newUrls, items);
    });
    return Database.allowedHosts;
  },
  
  updateallowedHosts: function() {
    this.storage.get(null, function(items) {
      var objectHasKeys = Object.keys(items).length > 0
      if( objectHasKeys )
        Database.allowedHosts = Object.assign(Database.allowedHosts, items);
      else
        Database.allowedHosts = {};
    });
  },
  
  getallowedHosts: function(object) {
    return this.allowedHosts;
  },
  
  allowOneHost: function(object) {
    this.storage.set(object);
    Database.updateallowedHosts();
  },
  
  removeAllowedHost: function(property) {
    this.storage.remove(property);
  },
  
  isHostAllowed: function(property) {
    return this.allowedHosts.hasOwnProperty( property );
  },
  
  setBlockedUrl: function(property) {
    if(this.isNewURL(property))
      localStorage[property] = 1;
  },
  
  isNewURL: function(property) {
    return !localStorage.hasOwnProperty(property);
  },
  
  isBlackListed: function(property) {
    return localStorage.hasOwnProperty(property);
  },
  
  removeUrlFromLocalStorage: function(key) {
    localStorage.removeItem(key);
    Database.updateallowedHosts();
  },
  
  getBlockedUrls: function() {
    return localStorage;
  }
}

Database.init();


window.chrome.storage.onChanged.addListener(function (storage) {
 // console.log( storage );
  Database.updateallowedHosts();
});