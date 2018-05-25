
var xhr = (function(url) {
	function getXHRObject()
	{
		var client = new XMLHttpRequest();


		return client;
	}

	function makeRequest(method, data, callback)
	{
		var client = getXHRObject();

		client.onreadystatechange = function()
		{
			if (this.readyState == 4)
			{
				var responseValue;
				if ('application/json' === this.getResponseHeader('Content-Type'))
				{
					try
					{
						responseValue = JSON.parse(this.responseText);
					}
					catch (exception)
					{
						console.error(exception.stack ? exception.stack : exception);
					}
				}
				else
				{
					responseValue = this.responseText;
				}

				callback(this.status, responseValue);
			}
		}

		client.open(method, url);
		client.send(data);
	}

	return {
		get: function(callback)
		{
			return makeRequest('GET', null, callback);
		},

		post: function(data, callback)
		{
			return makeRequest('POST', data, callback);
		}
	};
});
