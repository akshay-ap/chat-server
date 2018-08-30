/*jshint esversion: 6 */
const request = require('request');
var data_to_send={"object":"page","entry":[{"id":"1310022679077299","time":1491902650100,"messaging":[{"sender":{"id":"1399721456736511"},"recipient":{"id":"1310022679077299"},"timestamp":1491902649965,"message":{"mid":"mid.$cAAT9hgw1YwNhjZkebVbXFPVv69uz","seq":20718,"text":"hi"}}]}]};
const TAG='forwardEvents === ';
const config=require('./config');
const bot_message_url=config.CHATBOT_MESSAGE_URL;

function forwardBreadCrum (breadcrum_num,message_senderId)
{
	/*This code will be executed whenever user clicks any breadcrum
	  * breadcrum_num will contain a number.
	  *	This number is to be forward to the chat bot server.
	  *
	  *Changes to be made each time: entry[0].messaging[0].postback.payload=breadcrum_num
	  *								 entry[0].messaging[0].sender.id=socket.id
	  *Format for forwarding:
	  *
	  *	  {
			"object":"page",
			"entry":[{
			"id":"1310022679077299",
			"time":1491914964249,
			"messaging":[{
						"recipient":{
						"id":"1310022679077299"
									},
						"timestamp":1491914964249,
						"sender":{
									"id":"1399721456736511"
									},
						"breadcrum":{
						"payload":"breadcrum_num"
									}
						}]
					}]
		}
	  */
	var bread_crum_data={"object":"page","entry":[{	"id":message_senderId,
			"time":1491914964249,
			"messaging":[{"recipient":{"id":"1310022679077299"},
						"timestamp":Date.now(),
						"sender":{"id":message_senderId},
						"breadcrum":{"payload":breadcrum_num}
						}]
					}]
		};
	////console.log(TAG,"_____",JSON.stringify(bread_crum_data));
	  request({
		    url: bot_message_url,
		    method: "POST",
		    json: true,
		    headers: {
		        "content-type": "application/json",
		    },
		    body: bread_crum_data
		}, (err, res, body) => {
	    	if (err)
	    	{
	    		console.error(TAG," SERVER ERROR");

	    	}

	        //console.log(TAG," Beadcrum REPLY ",JSON.stringify(body));
	    });

////console.log(TAG,"BREAD CRUM NUM IS",breadcrum_num);
}//[end forwards breadcrum]




function forwardPostback(postback_string,message_senderId)
{
	//console.log(TAG,"In forward postback",postback_string,message_senderId);


	  /*This code will be executed whenever user clicks any button
	  * postback_clicked will contain a string.
	  *	This string is to be forward to the chat bot server.
	  *
	  *Changes to be made each time: entry[0].messaging[0].postback.payload=postback_clicked
	  *								 entry[0].messaging[0].sender.id=socket.id
	  *Format for forwarding:
	  *
	  *{
			"object":"page",
			"entry":[{
			"id":"1310022679077299",
			"time":1491914964249,
			"messaging":[{
						"recipient":{
						"id":"1310022679077299"
									},
						"timestamp":1491914964249,
						"sender":{
									"id":"1399721456736511"
									},
						"postback":{
						"payload":"register_YES"
									}
						}]
					}]
		}
	  */


	var data_to_send={"object":"page",
			"entry":[{"id":message_senderId,"time":1491914964249,
				"messaging":[{"recipient":{"id":"1310022679077299"},"timestamp":1491914964249,
					"sender":{id:null},"postback":{"payload":null}
				}]
			}]
	};

	//Change the data
	//console.log(TAG,"______postback_____",JSON.stringify(data_to_send));

	data_to_send.entry[0].messaging[0].postback.payload=postback_string;
	data_to_send.entry[0].messaging[0].sender.	id=message_senderId;
		////console.log(TAG,"In forwarded messages",JSON.stringify(data_to_send));

	  request({
		    url: bot_message_url,
		    method: "POST",
		    json: true,
		    headers: {
		        "content-type": "application/json",
		    },
		    body: data_to_send
		}, (err, res, body) => {
	    	if (err)
	    	{
	    		console.error(TAG," SERVER ERROR");

	    	}

	        //console.log(TAG,"POST BACK REPLY ",JSON.stringify(body));
	    });
}//[end forwardpostback]

function forwardDisconnect(message_senderId)
{
	//Call this function whenever socket emits an disconnect event
	/*This code will be executed whenever user clicks closes the tab
	* postback_clicked will contain a string.
	*	This string is to be forward to the chat bot server.
	*
	*Changes to be made each time: entry[0].messaging[0].postback.payload=postback_clicked
	*								 entry[0].messaging[0].sender.id=socket.id
	*Format for forwarding:
	*
	*{
		"object":"page",
		"entry":[{
		"id":"1310022679077299",
		"time":1491914964249,
		"messaging":[{

					"timestamp":1491914964249,
					"sender":{
								"id":"1399721456736511"
								},
					"disconnect":{
					"payload":"true"
								}
					}]
				}]
	}
	*/

	let disconnect_data={"object":"page",
			"entry":[{"id":message_senderId,"time":1491914964249,
				"messaging":[{"recipient":{"id":"1310022679077299"},"timestamp":1491914964249,
					"sender":{id:null},"disconnect":{"payload":null}
				}]
			}]
	};


	disconnect_data.entry[0].messaging[0].disconnect.payload=true;
	disconnect_data.entry[0].messaging[0].sender.id=message_senderId;
		////console.log(TAG,"In forwarded messages",JSON.stringify(data_to_send));

	  request({
		    url: bot_message_url,
		    method: "POST",
		    json: true,
		    headers: {
		        "content-type": "application/json",
		    },
		    body: disconnect_data
		}, (err, res, body) => {
	    	if (err)
	    	{
	    		console.error(TAG," SERVER ERROR");

	    	}

	        //console.log(TAG,"POST BACK REPLY ",JSON.stringify(body));
	    });



}

module.exports=
{
		forwardBreadCrum,
		forwardPostback,
		forwardDisconnect
};
