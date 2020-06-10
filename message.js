var Message = {
	sendMessageToBackground: function(messageObject, messageFunction){
		if(typeof messageFunction === "function" );
			chrome.runtime.sendMessage(messageObject, function(response) {
					messageFunction(response);
				return true;
			});
	}
}