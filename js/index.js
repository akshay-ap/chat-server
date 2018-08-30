/* jshint loopfunc:true */
/*globals $:false */
/*jshint esversion: 6 */

var isFirstMessage = true;

var card_views_current_pointer={};

var scroll_to_bottom=function()
{
	$("#messages").animate({
	scrollTop : $('#messages').prop("scrollHeight")
}, 300);
}

$(function() {
	var socket = io();


	//test btn
	// ON CLick listener for chat-button-circular
$('#test-btn').click(function() {
		//alert("__");
		socket.emit('test btn event');
	});

	// User clicked enter button
	$('#m').on("keypress", function(e) {
		if (e.keyCode === 13) {
			if ($('#m').val() !== '') {
				socket.emit('chat message', $('#m').val(), false);
			}
			$('#m').val('');
			return false; // prevent the button click from happening
		}
	});

	// ON CLick listener for chat-button-circular
	$('#chat-button-circular').click(function() {
		if (isFirstMessage === true) {
			socket.emit('chat message', $('#m').val(), true);
			isFirstMessage = false;
		}
		return true;
	});

	// Onclick Listener for breadCrums
	$(".breadcrumelement").each(function(index) {
		$(this).on("click", function() {
			// For the mammal value
			var clickId = $(this).attr('id');
			// alert(mammalKey);
			var crum_num = parseInt(clickId.substr(-1));
			socket.emit('user breadcrum message', crum_num);
		});
	});
	// User Clicked send button
	$('#btn-chat').click(function() {
		if ($('#m').val() !== '') {
			socket.emit('chat message', $('#m').val());
		}
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function(msg) {
		//msg=msg.replace(/\n/g, "<br/>");
		let msgtemp=msg;//.split("\n")//.join("<br />");;
		//console.log(msgtemp);
		//msg = msg.replace(/(?:\r\n|\r|\n)/g, '<br />');
		// Create a new text element to add to the 'messages'
		//var $text=$('textarea').val(msg);
		var $div_new_msg = $('<div/>').html(msgtemp);
		//$div_new_msg.append($text);
		// Add the CSS properties
		$div_new_msg.addClass('botMesageBox');

		$div_new_msg.append($('<br>'));

		$div_new_msg.append($('</span>'));

		$('#messages').append($div_new_msg);
		$('#messages').append('</br>');
		
		scroll_to_bottom();
	});

	// This section adds text to messages that the user has sent
	socket.on('chat user message', function(msg) {

//console.log(msg);
		// Create a new text element to add to the 'messages'
		var $div_new_msg = $('<div>').text(msg);
		$div_new_msg.addClass('userMessageBox');

		$div_new_msg.append($('<br>'));

		$('#messages').append($div_new_msg);
		$('#messages').append('</br>');
		scroll_to_bottom();

	});

	socket.on('chat button', function(divid, title, buttons) {

		// For each message of type button, add a new div to 'messages'
		// $div_new is a new divison

		title=title.replace(/\n/g, "<br>");

		//console.log("buttons00",buttons);

		var $div_new = $("<div/>", {
			id : divid
		});

		$div_new.html(title);
		$div_new.append($('<br>'));
		// Replace \n with </br> for html rendering
		// title = title.replace(/(?:\r\n|\r|\n)/g, '<br />');

		// Add the titles of the buttons
			// check if buttons is present
		if (typeof buttons !== 'undefined') {
			for ( var button in buttons) { // if(buttons.type)

				// Use $temp_button to define the characteristics of the button
				// It can contain a postback or a web-url
				var $temp_button = $('<input type="button">').val(buttons[button].title);
				$temp_button.addClass('button');
				$temp_button.attr('name', button);
				//$temp_button.addClass('button');
				// check if button is of postback type
				if (buttons[button].type === 'postback') {
					$temp_button.click(function() {
						socket.emit("chat postback message",
								buttons[this.name].payload);
					});
				} else if (buttons[button].type === 'web_url') {
					// Add the web_url to the button so that on click of button
					// new tab opens and user is redirected to it.
					$temp_button.on("click",
							function() {
								if (!((buttons[this.name].url)
										.match(/^[a-zA-Z]+:\/\//))) {
									buttons[this.name].url = 'http://' + buttons[this.name].url;
								}

								window.open(buttons[this.name].url, '_blank');
							});
				}
				// Append the button to new div
				$div_new.append($temp_button);
				$div_new.append($('<br>'));

			}
		}
		
		
				$div_new.addClass('botMesageBox');

		$div_new.append($('</span>'));
		$('#messages').append($div_new);
		scroll_to_bottom();


	});

	socket.on('server chat cardview', function(divid, title, data) {
		//console.log(divid, title,JSON.stringify( data));
		/*
		 * title= Title to be assigned to the div/cardview
		 *
		 * data[0]=title for each button of card view data[1]=ImageUrls
		 * data[2]=HREF for images data[3]=buttons_type data[4]=buttons data
		 */

		// $div_new is a new divison
		let $div_new = $("<div>", {id : 'tslshow'});

		// Replace \n with </br> for html rendering
		// title = title.replace(/(?:\r\n|\r|\n)/g, '<br />');

		// Add the titles of the buttons
		//$div_new.append($('<text>').text(title));
		
	
		$div_new.append($('<br>'));
		$div_new.append($('</span>'));
		$div_new.addClass('tslshow');

		// check if buttons is present
		if (typeof data !== 'undefined') {
			for (var item = 0; item < data.length; item++) {
				let $div_item = $("<div>");
				$div_item.addClass('bktibx');
				/*if(item!==0)
				{
					$div_item.css("display",'none');
	
				}*/
				let button_type = data[item].type;
				let img_url = data[item].item_url;
				let img_ref = data[item].image_url;
				let button_title = data[item].title;
				let button_data = data[item].payload;

//console.log("postback : ",data[item].type);

				let $temp_button = $('<input type="button"  >').val("View More");
				$temp_button.addClass('button');

				$temp_button.attr('name', item);
				//$temp_button.addClass('button');
				//let $temp_img=$('<a id='+item+' href="'+ img_url +'" target="_blank"><img src="' +img_ref +' /></a>');
				let $temp_img=$('<a id='+item+' href="'+ img_url +'" target="_blank"><img src="' +img_ref +'" height=100px width="100px"  /></a>');

				// check if button is of postback type
				if (button_type === 'postback') {
					$temp_button.click(function() {


						socket.emit("chat postback message", button_data);
					});
				} else if (button_type === 'web_url') {
					// Add the web_url to the button so that on click of button
					// new tab opens and user is redirected to it.
					$temp_button.on("click",
							function() {

								if (!((button_data).match(/^[a-zA-Z]+:\/\//))) {
									button_data = 'http://' + button_data;
								}
								window.open(button_data, '_blank');
							});
				}
				// Append the button to new div
				$div_item.append($temp_img);
				$div_item.append($('<br>'));
				$div_item.append($('<div>').html(button_title));

				$div_item.append($('<br>'));

				$div_item.append($temp_button);
				$div_item.append($(''));
				$div_item.append($('</span>'));

				$div_new.append($div_item);


			}
			//$div_new.nth-child(0).css('display','none');
		}


		/* Taken From :
		 * http://jsfiddle.net/yfqyq9a9/2/
		 * http://stackoverflow.com/questions/27313480/scroll-div-content-horizontally-using-left-and-right-arrow-in-jquery
		 * Expected formation:
		 *
			<div class="bstimeslider">
			    <div id="rightArrow"></div>
			        <div id="viewContainer">
			            <div id="tslshow">
			                <div class="bktibx"> 12:00   </div>
			                <div class="bktibx"> 12:30   </div>
			                <div class="bktibx"> 17:30   </div>
			             </div>
			        </div>
			        <div id="leftArrow"></div>
			</div>
		 *
		 * Here :
		 * $div_cardview =bstimeslider
		 * $div_container= viewContainer
		 * $div_new = 	tslshow
		 * $div_item = 	bktibx
		 * */


			//Display the first element of carousel
		//$div_new.first().css("display", "none");
		//	console.log($div_new.first());
	//	$div_new.append($('</span>'));

			let $div_cardview = $("<div/>");

			$div_cardview.addClass('bstimeslider');

			let $div_container = $("<div/>", {id : "viewContainer"});
			$div_container.addClass('viewContainer')
			$div_container.append($div_new);

			let l_id="l".concat(divid);
			let r_id="r".concat(divid);
			
			
			
			card_views_current_pointer[l_id]=divid;
			card_views_current_pointer[r_id]=divid;
			card_views_current_pointer[divid]={};
			card_views_current_pointer[divid]={curr:0,length:data.length};
			
			
			let $div_left = $("<div/>", {id:(l_id)});
			$div_left.addClass("leftArrow");
			let $div_right = $("<div/>", {id :(r_id)});
			$div_right.addClass("rightArrow");
			
			//Uncomment this for adding leftarrow
			//$div_cardview.append($div_left);
			$div_cardview.append($div_container);
			//Uncomment this for adding rightArrow
			//$div_cardview.append($div_right);

			$div_title=$('<div/>');
			$div_title.html(title);
			$div_title.addClass('botMesageBox');
			$('#messages').append($div_title);
			$('#messages').append($('<br>'));

			
			$ddd=$('<div/>');
			$ddd.addClass('botMesageBox');
			
			$ddd.append($div_cardview);
			
			
			$('#messages').append($('<br>'));
		$('#messages').append($ddd);
		scroll_to_bottom();

		
		var view = $("#tslshow");
		var move = "100px";
		var sliderLimit = 100;

		//console.log("AA",$("#"+divid).css('display','none'));
				
		$("#"+$div_left.attr('id')).click(function(){
			//console.log("This : ");
			var divid=card_views_current_pointer[$div_left.attr('id')];
			var data=card_views_current_pointer[divid];
			var curr=data.curr;
		    if (curr !==0)
		    {
		    	//console.log("This : ",$("#"+divid+" > :nth-child(0)"));//.css("display", "none");

		    	//$('#'+divid).nth-chlid(curr).css("display", "none");

		    	curr=curr-1;
		    	
		    	//$('#'+divid).nth-chlid(curr).css("display", "block");
		    	
		    	card_views_current_pointer[divid].curr=curr;
		    }
	    //	console.log(card_views_current_pointer[divid]);

		});

		$("#"+$div_right.attr('id')).click(function(){
			var divid=card_views_current_pointer[$div_right.attr('id')];
			var data=card_views_current_pointer[divid];

			var curr=data.curr;
		    if (curr !==data['length'])
		    {
		    	//console.log("AA",$("#"+divid));
		    	$("#"+divid+" > :nth-child(0)").css("display", "none");
		    	curr=curr+1;
		    	card_views_current_pointer[divid].curr=curr;
		    }
	    	//console.log(card_views_current_pointer[divid]);
		});



	});

	// BREADCRUM UPDATE SCRIPT USING SOCKET
	socket.on('server bread crum message', function(level, msg) {

		if (level === 1) {
			// Update level 1 message
			$('#breadcrum_level_1').text(msg);
		} else if (level === 2) {
			// Update level 2 message
			$('#breadcrum_level_2').text(msg);

		} else if (level === 3) {
			// Update level 3 message
			$('#breadcrum_level_3').text(msg);

		}
	});

});
