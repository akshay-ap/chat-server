/*jshint esversion: 6 */
var qs = require('querystring');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const request = require('request');
const config=require('./config');
const TAG='SERVER';
const forwardEvents=require('./forwardEvents');
var data_to_send={"object":"page","entry":[{"id":"1310022679077299","time":1491902650100,"messaging":[{"sender":{"id":"1399721456736511"},"recipient":{"id":"1310022679077299"},"timestamp":1491902649965,"message":{"mid":"mid.$cAAT9hgw1YwNhjZkebVbXFPVv69uz","seq":20718,"text":"hi"}}]}]};
const bot_message_url=config.CHATBOT_MESSAGE_URL;
var bot_breadcrum_url='';

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/temp', function(req, res){
	  res.sendFile(__dirname + '/index.html');
	});

app.get('/index.js', function(req, res){
	  res.sendFile(__dirname + '/js/index.js');
	});

app.get('/index.css', function(req, res){
	  res.sendFile(__dirname + '/css/index.css');
	});

global.CLIENTS={};

/*
 * Use this function to find what type of message the chat bot has sent.
 * Types of messages: 	text        JSONDATA.message.text
 * 						buttons		JSONDATA.message.attachment.type.payload.template_type === 'button'
 * 						card-views  JSONDATA.message.attachment.type.payload.template_type === 'generic'
 *
 *
 *
 * */


function analyseResponse(JSONDATA)
{
	console.log(TAG,"RECEIPEND ID",JSONDATA.recipient.id);

	//Check if chat bot sent a text reply
	if(typeof JSONDATA.message.text !=='undefined')
	{
		//Only text is to be replied to client
		if(typeof global.CLIENTS[JSONDATA.recipient.id]!=='undefined')
		{
			global.CLIENTS[JSONDATA.recipient.id].emit('chat message',JSONDATA.message.text);

		}
	}

	else if(typeof JSONDATA.message.attachment!=='undefined'&&JSONDATA.message.attachment.type==='template')
	{

	//	console.log("___________________Message TYPE OF ATTACHMENT___________________________");
	//	console.log(JSON.stringify(JSONDATA));
		/*
		 * Attachment is present
		 * Attachment can be a button of cardview
		 *
		 *
		 */
		if(JSONDATA.message.attachment.payload.template_type==='button')
		{
		//	var Title=JSONDATA.message.attachment.payload.text;
			//: "+ JSON.stringify(JSONDATA.message.attachment.payload.text)
			if(typeof global.CLIENTS[JSONDATA.recipient.id]!=='undefined')
			{
			
			global.CLIENTS[JSONDATA.recipient.id].emit('chat button',new Date().toISOString(),JSONDATA.message.attachment.payload.text,JSONDATA.message.attachment.payload.buttons);
			}
			
			}
		else if(JSONDATA.message.attachment.payload.template_type==='generic')
		{
			//global.CLIENTS[JSONDATA.recipient.id].emit('chat message',"Cardview : "+ JSON.stringify(JSONDATA));

			let mainTitle=JSONDATA.message.attachment.payload.title;
			let data_items=JSONDATA.message.attachment.payload.elements;
		//	console.log(mainTitle);
			//console.log(data_items);
			if(typeof global.CLIENTS[JSONDATA.recipient.id]!=='undefined')
			{
			
			global.CLIENTS[JSONDATA.recipient.id].emit('server chat cardview',Date.now(),mainTitle,data_items);
			//console.log(JSON.stringify(JSONDATA));
			}
		}
		else
		{

			console.log(JSON.stringify(JSONDATA));

		}

	}
	else
	{
		console.log(JSON.stringify(JSONDATA));
	}

	return true;
}

app.post('/message', function(req, res){
	  console.log("MESSAGE FROM CHAT BOT SERVER");

	  var body = '';

	    req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                {request.connection.destroy();}
        });
        req.on('end', function () {
            var post = qs.parse(body);
            var JSON_RESPONSE_TO_BE_ANALYSED=JSON.parse(body.replace(/\\"/g,"\"").substr(1).slice(0, -1));
           if(global.CLIENTS[JSON_RESPONSE_TO_BE_ANALYSED.recipient.id]!==null){ analyseResponse(JSON_RESPONSE_TO_BE_ANALYSED);}
        });

	  res.send('received the message');

	});


app.post('/postback', function(req, res){
	  console.log("MESSAGE FROM CHAT SERVER about the postback button");
	  var body = '';
	    req.on('data', function (data) {
          body += data;
          // Too much POST data, kill the connection!
          // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
          if (body.length > 1e6)
              {request.connection.destroy();}
      });

      req.on('end', function () {
          var post = qs.parse(body);
          var JSON_RESPONSE_TO_BE_ANALYSED=JSON.parse(body.replace(/\\"/g,"\"").substr(1).slice(0, -1));
          analyseResponse(JSON_RESPONSE_TO_BE_ANALYSED);
      });
	  res.send('received the message');

	});


app.get('/profile', function(req, res){
	  res.send({first_name:"",last_name:''});
	});

//requests to update the breadcrums
app.post('/breadcurm', function(req, res){
	  console.log("MESSAGE FROM CHAT SERVER about the breadcrum");
	  var body = '';
	    req.on('data', function (data) {body += data;});
	    req.on('end', function () {
        var post = qs.parse(body);
        var JSON_BREADCRUM=JSON.parse(body.replace(/\\"/g,"\"").substr(1).slice(0, -1));
      // console.log(TAG,"server bread crum message__",JSON_BREADCRUM);
        if(global.CLIENTS[JSON_BREADCRUM.message.recipientid]!==null)
        {
            global.CLIENTS[JSON_BREADCRUM.message.recipientid].emit("server bread crum message",JSON_BREADCRUM.message.level,JSON_BREADCRUM.message.message);

        }

	    });
	  res.send('updated the breadcrum');

	});

io.on('connection', function(socket){

 	var socketId = socket.id;
  	console.log(socket.request.connection.remoteAddress);

	var temp={};
	temp[socket.id]=socket;
	//CLIENTS.push(temp);
	global.CLIENTS[socket.id]=socket;
	console.log(TAG,"SOCKET Id ",socket.id);
	temp={};

	 // console.log('a user connected');
	  socket.on('chat message', function(msg,isFirstMessage){
		 // console.log(TAG,'_________',isFirstMessage);
		  if(isFirstMessage===false)
		  {socket.emit('chat user message', msg);}
		  data_to_send.entry[0].messaging[0].message.text=msg;
		  data_to_send.entry[0].time= new Date().toISOString();
		  data_to_send.entry[0].messaging[0].sender.id= socket.id;

	//	  console.log(TAG,"MESSAGE BEING SENT TO SERVER\n",JSON.stringify(data_to_send));
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
		    	{console.log(TAG," SERVER ERROR"); }

		        console.log(TAG,JSON.stringify(body));
		    });
	  });

	  socket.on('chat postback message', function(postback_clicked){

		  forwardEvents.forwardPostback(postback_clicked,socket.id);
		  console.log(TAG,"POSTBACK RECEIVED",postback_clicked);

	  });

	  socket.on('user breadcrum message', function(bread_crum_num){

		  forwardEvents.forwardBreadCrum(bread_crum_num,socket.id);
	//	  console.log(TAG,"POSTBACK RECEIVED",bread_crum_num);

	  });

	  socket.on('disconnect', function(){
	  //  console.log('user disconnected');
		  global.CLIENTS[socket.id]=null;
      forwardEvents.forwardDisconnect(socket.id);
	   // delete global.CLIENTS[socket.id];

	  });



	  socket.on('test btn event', function(){
	  //  console.log('user disconnected');
	let imag='http://19966-presscdn-0-84.pagely.netdna-cdn.com/wp-content/uploads/2016/12/the-best-2016.png';
	let dummydata={payload:"YO YO",title:'TEMP TITLE',type:'postback',item_url:imag,image_url:imag};
	let data=[dummydata,dummydata,dummydata,dummydata,dummydata,dummydata,dummydata];
		socket.emit('server chat cardview',"sdfd","TITLE OF DIV ",data);
		  console.log(TAG,"CARD VIEW EVENT");
	  });

	});



http.listen(9000, function(){
  console.log('listening on *:9000',"__new");
});
