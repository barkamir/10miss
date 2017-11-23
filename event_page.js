console.log('starting 10Miss extension');
const ALARM_NAME = 'checkout_check';

chrome.webNavigation.onDOMContentLoaded.addListener(onCheckoutReached, {'url': [ {'urlContains': 'www.10bis.co.il/Checkout'} ]});
chrome.webNavigation.onDOMContentLoaded.addListener(onCheckoutCompleted, {'url': [ {'urlContains': 'www.10bis.co.il/Orders/OrderSubmitSuccess'} ]});

chrome.alarms.onAlarm.addListener(onAlarmCallback);
chrome.alarms.create(ALARM_NAME, { 'delayInMinutes': 1, 'periodInMinutes': 1});
chrome.notifications.onButtonClicked.addListener(onNotificationButtonsClicked);

chrome.runtime.onMessage.addListener(onRestaurantNameFetched);


function onCheckoutReached(details) {
	console.log('checkout reached...');
	updateStatus(false);
}


function onRestaurantNameFetched(request) {
	console.log('recieved message: ' + JSON.stringify(request));
	if (request && request.restaurantName) {
			updateStatus(false, request.restaurantName);
	}
}
function onCheckoutCompleted(details) {
	console.log('checkout completed');
	updateStatus(true);
}

function onStorageSetCallback(result) {
	if(chrome.runtime.lastError) {
		console.error('failed to set in storage: ' + chrome.runtime.lastError.message)
	} else {
		console.log('status stored successfully')				
	}
}

function onAlarmCallback(alarm) {
	console.log('alarm triggered');
	chrome.storage.sync.get('status', checkUnfinishedOrder);
}

function checkUnfinishedOrder(item) {
	if (item && item.status && !item.status.completed) {
		createNotification(item.status.restaurantName);
	}
}

function createNotification(restaurantName) {
	chrome.notifications.create("", {
        type:    "basic",
        iconUrl: "icon.png",
        title:   "10מיס - שכחת לסיים הזמנה",
        message: restaurantName,
        contextMessage: "מישהו פה הולך לאכול מאוחר",
        buttons: [{
            title: "הזמנתי! תודה",
        }]
    })
};

function onNotificationButtonsClicked(notificationId, buttonIndex){
	console.log('will stop')
	updateStatus(true);
}

function updateStatus(status, restaurantName) {
	var storageEntry = {status: {'completed' : status, 'time' : Date.now(), 'restaurantName' : restaurantName}};
	console.log('attempting to store: ' + JSON.stringify(storageEntry))
	chrome.storage.sync.set(storageEntry, onStorageSetCallback);
 }