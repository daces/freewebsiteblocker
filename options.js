window.addEventListener('DOMContentLoaded', function () {
  var excludeList = document.getElementById('exclude-list');
  var buttonSave = document.getElementById('button-exclude_save');
    
  chrome.runtime.sendMessage({msg: "WebSafe_Get_Exclude_List"}, function(response) {
    try{
      excludeList.value = response;
    }
    catch(e){
      return true;
    }
  });
  buttonSave.addEventListener('click', function(event) {
    console.log( "list", excludeList.value );
     chrome.runtime.sendMessage({msg: "WebSafe_Set_Exclude_List", list: excludeList.value});
  });


});

function trackExeption(error, fatal){
  //ga('send', 'exception', {'exDescription': error.message,'exFatal': fatal});
}

function error(e){
  trackExeption(e.error);
}

window.addEventListener("error", error, true);