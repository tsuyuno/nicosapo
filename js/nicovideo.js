function isLogined()
{
	var promise = new Promise(function(resolve, reject) {
		var posting = $.post("http://www.nicovideo.jp/api/mylistgroup/list", function(response) {
            var status = $(response).attr('status');
			console.log(status);
            switch (status) {
                case 'ok':
                    resolve(true);
                    break;
                case 'fail':
                    reject(false);
                    break;
            }
		}, 'json');
	});

	return promise;
}

function getSessionId() {
	
	var promise = new Promise(function(resolve, reject) {

		var posting = $.post("http://api.ce.nicovideo.jp/api/v1/session.create",
		{}
		);

		posting.done(function(data) {

			var status = $(data).find('nicovideo_user_response').attr('status');
			
			switch (status) {
				case "ok":
					var sessionId = $(data).find('session').text();
					console.info('session: ' + sessionId);
					resolve(sessionId);
					break;
				case "fail":
					reject(new Error('Request failed: status is "fail".'));
					break;
			}
		});
	});

	return promise;
}

function getSubscribe(sessionId)
{
	var promise = new Promise(function(resolve, reject) {
		
		var dummy = Math.floor(Math.random () * 1000);
		var request = $.ajax({
			url: "http://api.ce.nicovideo.jp/liveapi/v1/user.subscribe?__context=" + Math.floor(Math.random () * 1000),
			method: "POST",
			dataType: "xml",
			headers: {
				"x-nicovita-session": sessionId
			}
		});

		request.done(function (videoInfos) {
			console.log("cache: " + $(videoInfos).find('total_count').text());
			resolve(videoInfos);
		});

		request.fail(function( jqXHR, textStatus ) {
			reject(new Error('Request failed: ' + textStatus ));
		});


	});

	return promise;
}

function getCheckList()
{

	var promise = new Promise(function(resolve, reject) {

		var posting = $.get("http://flapi.nicovideo.jp/api/getchecklist",
		{}
		);

		// I dont know why "posting" calls fail(), not done().
		posting.fail(function(data) {

			let text = $.parseJSON(data.responseText);
			var status = text.status;

			switch (status) {
				case "OK":
					var checkList = text.community_id;
					resolve($(checkList));
					break;
				default:
					reject(new Error('Request failed: status is "fail".'));
					break;
			}
		});
	});

	return promise;
}

function getStatusOfBroadcast(broadcastId)
{
	console.log('broadcastId: ' + broadcastId);
	return new Promise(function(resolve, reject) {
		var endpoint = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=" + broadcastId;
		var posting  = $.get(endpoint);

		posting.done(function(response) {
			console.info(response);
			let status = $(response).find('getplayerstatus').attr('status');
			console.info(status);

			if (status == 'ok') {
				resolve('ONAIR');
			}
			if (status == 'fail') {
				let errorCode = $(response).find('error code').text();
				console.info(errorCode);
				if (errorCode == 'error') {
					resolve('ENDED');
				}
			}

			reject(new Error('Illegal status.'));
		});
	});
}


function getBroadcastInformations(communityId)
{
	return new Promise(function(resolve, reject) {
		var endpoint = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=" + communityId;
		var posting  = $.get(endpoint);

		posting.done(function(response) {
			console.info(response);
			let status = $(response).find('getplayerstatus').attr('status');
			console.info(status);
			
			if (status == 'fail') {
				let errorCode = $(response).find('error code').text();
				console.info(errorCode);
				if (errorCode == 'error') {
					resolve(null);
				}
			}

			let informationsOfBroadcast = $(response).find('stream');
			resolve(informationsOfBroadcast);
		});
	});
}

