"use strict"
// Naming Convention examples:
// var chrome_storage - snake_
// function firstName() - camelCase
// module Database - Capitalize
  /*
database:
page_requests : {
0: (3) [1, 2, 3]
1: (3) [4, 5, 6]}
pages: (3) ["facebook.com", "youtuvw.xom", "jquery.com"]  */
var WebSafeDatabase = (function (){
  var chrome_storage = chrome.storage.local;
  var database = {
    pages: [],
    page_requests: {},
    exclude_list: ""
  };

  function getExcludeList(){
    return database.exclude_list;
  }
  
  function setExcludeList(newList){
    
    console.log( newList );
    database.exclude_list = newList;
    return true;
  }
  
  function setStorage(  ){
    console.log( "page added to chrome_db" );
    chrome_storage.set( database )
  }
  
  function updateStorage(  ){
    chrome_storage.get(null, function( chrome_db ){
      if ( chrome_db.hasOwnProperty("pages" ) == true ){
        console.log( chrome_db );
        Object.assign( database, chrome_db )
        database = chrome_db;
      }
    });
  }

  function getPageIndex(page){ return database.pages.indexOf( page );  }
  function getRequestIndex(request){ return database.pages.indexOf( request );  }
  
  function isPageNonExsistent(page) { return database.pages.includes( page ) == false; }
  
  function appendNewPage(page) { return database.pages.push( page ); }
  function allowNewPage(page) { return database.page_requests[ getPageIndex( page ) ] = [ getPageIndex( page )];}
  
  function addAllowedPage(page){
    if( isPageNonExsistent( page ) ){
      appendNewPage( page )
      allowNewPage( page )
    console.log( "page added")
    }
    else {
      allowNewPage( page )
    console.log( "page allowNewPage")
    }
  }  

  function removeAllowedPage( page ){
    database.page_requests[ getPageIndex(page) ][0] = -1;
  }

  function allowRequest(page, request){
    if( isExistingPage( page ) && isExistingRequest( request )){
      if( PageRequestNonExsistent(page, request) ){
        database.page_requests[ getPageIndex(page) ].push( getRequestIndex(request) );
        return true;
      }
    }
    return false;
  }  
  
  function addAllowedRequest(page, request){
    if( isExistingPage( page ) && isExistingRequest( request ) ){
      if( PageRequestNonExsistent(page, request) ){
        database.page_requests[ getPageIndex(page) ].push( getRequestIndex(request) );
        return true;
      }
    }
    
    if( isExistingPage( page ) ){
      if ( isExistingRequest(request) )
        database.page_requests[ getPageIndex(page) ].push( getRequestIndex(request) );
      else {
        appendNewPage(request);
        database.page_requests[ getPageIndex(page) ].push( getRequestIndex(request) );
      }
    }
  }  

  function removeAllowedRequest(page, request){
    database.page_requests[ getPageIndex(page) ]
      .splice( database.page_requests[ getPageIndex(page) ].indexOf( request), 1 );
  } 

  function getAllowedRequests(page){
    if( isExistingPage( page ) ){
      var requests = [];
      database.page_requests[ getPageIndex(page) ].forEach(function(request_index){
        requests.push( database.pages[ request_index ] );
      });
      return requests;
    }
    return [];
  }  
    
  function isPageBlocked( page ){ 
    if( isPageNonExsistent( page ) )//database.pages.indexOf( page ) == -1 )
      return true; 
    //if( database.pages.indexOf( page ) > -1  && !isRequestPage( page ) )
    if( isRequestPage( page ) ){
      if ( database.page_requests[ getPageIndex( page )][0] == -1 ){
        return true; 
      }
    }
    if( !isRequestPage( page ) ) {
      return true;
    }
    return false;  
  }  
  
  function isRequestBlocked( page, request ){ 
  //console.log( page, " req : " , request );
    if( page != request ) {
      if( isExistingPage( page ) && isRequestPage( request) ){
        return false;
      }
      if( isExistingPage( page ) && isExistingRequest(request) ){
        if( PageRequestNonExsistent( page, request ) )
          return true; 
      }
      if( isExistingPage( page ) && isExistingRequest(request) == false ){
        return true; 
      }
      else {
        return true;
      }
    }
    return false;  
  }

  function isOnlyRequestBlocked( page, request ) {
    if( page != request ) {
      if( isExistingPage( page ) && isExistingRequest(request) ){
        if( isRequestPage( page ) ){
          if( database.page_requests[ getPageIndex( page )].includes( getRequestIndex( request ) ) ){
            return false; 
          }
        }
        else {
          return true;
        }
      }
        return true;
    }
    if( isRequestPage( request ) ){
      return false; 
    }
    return false; 
  }
  
  function isExistingPage(page) { return database.pages.indexOf( page ) > -1; }
  function isExistingRequest(request) { return database.pages.indexOf( request ) > -1; }
  function isRequestPage( request ) { return database.page_requests.hasOwnProperty( getPageIndex( request ) ) == true; }
  function PageRequestNonExsistent(page, request) { 
    return database.page_requests[ getPageIndex( page ) ].indexOf( getRequestIndex(request) ) == -1 ;
  }

  var temp_blocked_hosts = [];
  function setTempBlockedHosts(initiator, hostname){
    if( istUndefined( hostname ) )
      return false; // trow new error ?
    if( isOnlyRequestBlocked( initiator,hostname ) ){
      if( istUndefined( temp_blocked_hosts[initiator] ) )
        temp_blocked_hosts[initiator] = [];
      if( temp_blocked_hosts[initiator].indexOf(hostname) === -1 )
        temp_blocked_hosts[initiator].push( hostname );
    }
  }
  
  function removeTempBlockedHost(initiator, hostname){
    return temp_blocked_hosts[initiator].splice(temp_blocked_hosts[initiator].indexOf(hostname), 1);
  }
  
  function getTempBlockedHosts( initiator ){
    return temp_blocked_hosts[initiator];
  }
  
  function getNumberOfTempBlocked(initiator) {
    if( istUndefined( temp_blocked_hosts[initiator] ) )
      return 0;
    else
      return temp_blocked_hosts[initiator].length;
  }
  
  function istUndefined( variable ){
    return typeof variable === "undefined"
  }
  
  
  updateStorage( );
  var public_api = {
    setStorage: setStorage,
    getAllowedRequests: getAllowedRequests,
    addAllowedRequest: addAllowedRequest,
    allowRequest: allowRequest,
    removeAllowedRequest: removeAllowedRequest,
    removeAllowedPage: removeAllowedPage,
    addAllowedPage: addAllowedPage,
    isPageBlocked: isPageBlocked,
    isRequestBlocked: isRequestBlocked,
    isOnlyRequestBlocked: isOnlyRequestBlocked,
    isExistingRequest: isExistingRequest,
    setTempBlockedHosts: setTempBlockedHosts,
    getTempBlockedHosts: getTempBlockedHosts,
    removeTempBlockedHost: removeTempBlockedHost,
    getNumberOfTempBlocked: getNumberOfTempBlocked,
    getExcludeList: getExcludeList,
    setExcludeList: setExcludeList,
    database: database
  };
  return public_api;
})();


