// chrome.runtime.sendMessage({header: document.querySelectorAll('table.orderConfirmationTable th')});
var attempts = 0;
var checkElement = setInterval(function() {
	if (document.querySelectorAll('table.orderConfirmationTable th').length) {
		clearInterval(checkElement);
		console.log('found order confirmation');
		var restaurantName = getRestaurantName(document.querySelectorAll('table.orderConfirmationTable th')[0]);

		chrome.runtime.sendMessage({restaurantName: restaurantName});
	}

	if (attempts == 10)
	{
		clearInterval(checkElement);
	}
}, 1000);

function getRestaurantName(elm) {
	console.log('getting rest name from: ' + JSON.stringify(elm));
	if (!elm) return null;

	var regex = /אנא אשר\/י את הזמנתך ממסעדת (.*)/;
	var result = regex.exec(elm.textContent);
	return result && result.length == 2 && result[1].trim();
}