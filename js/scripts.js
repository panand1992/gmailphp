var newDraft = false;
var DraftID = null;
var user=getCookie("email");
var apiURL = "http://localhost:8888/pramolta/api/";
var locationURL = "http://"+location.host;
var replyMailID = 0;
$(document).ready(function(){
	checkSession();
	$("#userFullName").html(user);
    var composeBodyHtml;
    var replyBodyHtml;
    $("#composeEmailBody").focus(function(){
        composeBodyHtml = $("#composeEmailBody").html();
    });
    $("#composeEmailBody").blur(function(){
        var composeBodyHtmlNew = $("#composeEmailBody").html();
        if(composeBodyHtml != composeBodyHtmlNew){
            saveToDrafts();
        }
    });
    $("#replyEmailBody").focus(function(){
        replyBodyHtml = $("#replyEmailBody").html();
    });
    $("#replyEmailBody").blur(function(){
        var replyBodyHtmlNew = $("#replyEmailBody").html();
        if(replyBodyHtml != replyBodyHtmlNew){
            saveReplyToDrafts();
        }
    });
    if(user != ""){
    	loadMailList();
    }
});

function redirectFn(val){
    window.location.assign(locationURL + val);
}

function checkSession(){
	var user=getCookie("email");
    if (user != "" && location.pathname == "/pramolta/login.html") {
        redirectFn("/pramolta");
    } 
    else if(user == "" && location.pathname != "/pramolta/login.html"){
    	redirectFn("/pramolta/login.html")
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function loginFn(){
	var email = $("#inputEmail").val();
	var password = $("#inputPassword").val();
	if(email != "" && password != ""){
		$.post(apiURL + "checkLogin.php",
	    {
	        email: email,
	        password: password
	    },
	    function(data, status){
	    	var response = JSON.parse(data);
	        if(response.success == true){
	        	var d = new Date();
			    d.setTime(d.getTime() + (24*60*60*1000));
			    var expires = "expires=" + d.toGMTString();
			    document.cookie = "email="+email+"; "+expires;
			    redirectFn("/pramolta");
	        }
	        else{
	        	alert("invalid login or password");
	        }
	    });
	}
}

function logoutFn(){
	document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	redirectFn("/pramolta/login.html");
}

function showComposeMail(){
	$(".compose-email").show();
	$(".mail-attachment").hide();
	newDraft = true;
	DraftID = null;
}

function closeComposeMail(){
	$(".compose-email").hide();
	$("#composeEmailTo").val("");
	$("#composeEmailSubject").val("");
	$("#composeEmailBody").val("");
	$(".compose-email").hide();
	$(".mail-footer").html('<button class="btn btn-primary" onclick="sendMail(false, null)">Send</button>' +
	'<a href="javascript:void(0)" onclick="uploadAttachmentFn()"><span class="glyphicon glyphicon-paperclip"></span></a>' +
	'<input type="file" id="uploadAttachment" onchange="saveToDrafts()">');
}

function sendMail(replyMail, mailID){
	var recipient = $("#composeEmailTo").val();
	var subject = $("#composeEmailSubject").val();
	var body = $("#composeEmailBody").html();
	var sender = user;
	var file_data = $('#uploadAttachment').prop('files')[0];   
    var form_data = new FormData();                  
    form_data.append('file', file_data);
    form_data.append('recipient', recipient);
    form_data.append('subject', subject);
    form_data.append('body', body);
    form_data.append('sender', sender);
    form_data.append('DraftID', DraftID);
    if(replyMail == true){
    	form_data.append('emailID', mailID);
    }
	if(recipient != ""){
		$.ajax({
	        url: apiURL + "sendmail.php",
	        type: 'post',
	        dataType: 'json',
	        cache: false,
	        contentType: false,
	        processData: false,
	        data: form_data,
	        success: function(data) {
	            $("#composeEmailTo").val("");
				$("#composeEmailSubject").val("");
				$("#composeEmailBody").val("");
				$(".compose-email").hide();
				$(".compose-email .mail-footer").html('<button class="btn btn-primary" onclick="sendMail(false, null)">Send</button>' +
				'<a href="javascript:void(0)" onclick="uploadAttachmentFn()"><span class="glyphicon glyphicon-paperclip"></span></a>' +
				'<input type="file" id="uploadAttachment" onchange="saveToDrafts()">');
	        }
	    });
	}
	else{
		alert("Enter atleast one recipent");
	}
}

function sendReplyMail(replyMail, mailID){   
    var recipient = $("#replyEmailTo").val();
    var subject = $("#replyEmailSubject").val();
    var body = $("#replyEmailBody").html();
    var sender = user;
    var file_data = $('#uploadAttachmentReply').prop('files')[0];   
    var form_data = new FormData();                  
    form_data.append('file', file_data);
    form_data.append('recipient', recipient);
    form_data.append('subject', subject);
    form_data.append('body', body);
    form_data.append('sender', sender);
    form_data.append('DraftID', DraftID);
    form_data.append('replyMail', replyMail);
    if(replyMail == true){
        form_data.append('emailID', mailID);
    }
    if(recipient != ""){
        $.ajax({
            url: apiURL + "sendmail.php",
            type: 'post',
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            success: function(data) {
                $("#replyEmailTo").val("");
                $("#replyEmailSubject").val("");
                $("#replyEmailBody").val("");
                $(".reply-email .mail-footer").html('<button class="btn btn-primary" onclick="sendReplyMail(false, null)">Send</button>' +
                '<a href="javascript:void(0)" onclick="uploadAttachmentReplyFn()"><span class="glyphicon glyphicon-paperclip"></span></a>' +
                '<input type="file" id="uploadAttachmentReply" onchange="saveReplyToDrafts()">');
                $(".reply-email").hide();
                getMailDetails(mailID);
            }
        });
    }
    else{
        alert("Enter atleast one recipent");
    }
}

function showMailList(val){
	$(".mail-details-content").hide();
    $(".mail-list").show();
    var showSender;
    var showDate = convertDate(val.time);
    var appendLi = "<li ";
    if(val.sender){
        showSender = showSenderName(val.sender);
        if(val.readMail){
            appendLi += "class='readMail'";
        }
    }
    else{
        showSender = showSenderName(val.recipient);
        appendLi += "class='readMail'";
    }
    appendLi += "><div onclick='getMailDetails("+val.id+", false)'>"+
        "<ul>"+
            "<li class='sendername'>";
    if(val.mailCount == 1){
        if(val.draftCount == 1){
            appendLi += "<span>Draft</span>";
        }
        else{
            appendLi += showSender;
        }
    }
    if(val.mailCount > 1){
        appendLi += showSender + " ("+val.mailCount+")";
        if(val.draftCount == 1){
            appendLi += ", <span>Draft</span>";
        }
        else if(val.draftCount > 1){
            appendLi += ", <span>Drafts</span>("+val.draftCount+")";
        }
    }
    appendLi += "</li>"+
            "<li class='mailContent'><div class='mailSubjectBody'><span class='subject'>"+val.subject+"</span> - "+
                "<span class='body'>"+val.body+"</span></div>"
            +"</li>"+
            "<li class='mailTime'>";
    if(val.attachments != ""){
        appendLi += "<span class='glyphicon glyphicon-paperclip'></span>";
    }
    appendLi += showDate+"</li>"+
        "</ul></div>" +
    "</li>";
    $(".mail-list > ul").append(appendLi);
}

function convertDate(val){
	var showDate="";
	var todayDate = new Date();
    var mailDate = new Date(val);
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	if(todayDate.getFullYear() == mailDate.getFullYear()){
		if(todayDate.getMonth() == mailDate.getMonth()){
			if(todayDate.getDate() == mailDate.getDate()){
                if((mailDate.getHours()%12) < 10){
                    showDate += "0";
                }
                showDate += (mailDate.getHours()%12) + ":";
                if(mailDate.getMinutes() < 10){
                    showDate += "0";
                }
                showDate += mailDate.getMinutes();
				if(mailDate.getHours() < 12){
					showDate += " am";
				}
				else{
					showDate += " pm";
				}
			}
			else{
				showDate = months[mailDate.getMonth()] + " " + mailDate.getDate();
			}
		}
		else{
			showDate = months[mailDate.getMonth()] + " " + mailDate.getDate();
		}
	}
	else{
		showDate = mailDate.getDate() + "/" + (mailDate.getMonth()+1) + "/" + mailDate.getFullYear();
	}
	return showDate;
}

function showSenderName(val){
    var showName="";
    if(val.length > 3){
        showName = val[val.length - 1].split(" ")[0] + " .. " + val[1].split(" ")[0] + ", " + val[0].split(" ")[0];
    }
    else if(val.length > 1){
        for(var i=val.length-1;i>=0;i--){
            if(i == 0){
                showName += val[i].split(" ")[0];
            }
            else{
                showName += val[i].split(" ")[0] + ", ";
            }
        }
    }
    else{
        showName = val[0];
    }
    return showName;
}

function loadMailList(){
	$.post(apiURL + "getmailList.php",
    {
        email: user
    },
    function(data, status){
    	var mailList = JSON.parse(data);
    	$(".mail-list > ul").html("");
        for(var i=0;i<mailList.length;i++){
        	showMailList(mailList[i]);
        }
    });
}

function loadTrashList(){
	$.post(apiURL + "getTrashList.php",
    {
        email: user
    },
    function(data, status){
    	var mailList = JSON.parse(data);
    	$(".mail-list > ul").html("");
        for(var i=0;i<mailList.length;i++){
        	showMailList(mailList[i]);
        }
    });
}


function loadSentList(){
	$.post(apiURL + "getSentMail.php",
    {
        email: user
    },
    function(data, status){
    	var mailList = JSON.parse(data);
    	$(".mail-list > ul").html("");
        for(var i=0;i<mailList.length;i++){
            showMailList(mailList[i]);
        }
    });
}

function loadDraftList(){
	$.post(apiURL + "getDraftList.php",
    {
        email: user
    },
    function(data, status){
    	var mailList = JSON.parse(data);
    	$(".mail-list > ul").html("");
        for(var i=0;i<mailList.length;i++){
        	showMailList(mailList[i]);
        }
    });
}

function getMailTime(val){
    var showDate;
    var mailDate = new Date(val);
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    showDate = days[mailDate.getDay()] + ", " + months[mailDate.getMonth()] + " " + mailDate.getDate() + ", " + mailDate.getFullYear(); 
    showDate += " at ";
    if((mailDate.getHours()%12) < 10){
        showDate += "0";
    }
    showDate += (mailDate.getHours()%12) + ":";
    if(mailDate.getMinutes() < 10){
        showDate += "0";
    }
    showDate += mailDate.getMinutes();
    if(mailDate.getHours() < 12){
        showDate += " am";
    }
    else{
        showDate += " pm";
    }
    return showDate;
}

function getMailDetails(val, isDraft){
    $(".reply-email").hide();
	$.post(apiURL + "getMail.php",
    {
        emailID: val,
        sender: user
    },
    function(data, status){
    	var mailDetails= JSON.parse(data);
    	if(isDraft == true){
    		$(".compose-email").show();
			if(mailDetails[0].attachments != ""){
				$(".mail-attachment").show();
				$(".mailFileName").html(mailDetails[0].attachments);
			}
			else{
				$(".mail-attachment").hide();
			}
			DraftID = mailDetails[0].id;
			$("#composeEmailTo").val(mailDetails[0].recipientEmail);
			$("#composeEmailSubject").val(mailDetails[0].subject);
			$("#composeEmailBody").val(mailDetails[0].body);
    	}
    	else{
            $(".mail-list").hide();
            $(".mail-details-content").show();
            $(".mail-details-subject").html(mailDetails[mailDetails.length-1].subject);
            var showMailDetails = "";
            for(var i=0;i<mailDetails.length;i++){
                var showDate = getMailTime(mailDetails[i].time);
                showMailDetails += '<li><div class="mail-details-email">'+
                        '<div class="col-sm-12">'+
                            '<div class="row">'+
                                '<p class="mail-details-recipient"><span class="mail-details-recipientName">'+mailDetails[i].senderName+'</span> <<span class="mail-details-recipientEmail">'+mailDetails[i].senderEmail+'</span>></p>'+
                                '<p class="mail-details-sender">to: '+mailDetails[i].recipientEmail+'</p>'+
                                '<p class="mail-details-date">'+showDate+'</p>'+
                            '</div>'+
                        '</div>'+
                        '<div class="clearfix"></div>'+
                    '</div>'+
                    '<div class="mail-details-body">'+mailDetails[i].body+'</div>';
                    if(mailDetails[i].attachments != ""){
                        showMailDetails += '<div class="mail-details-attachment">'+
                                '<a href="javascript:void(0)" download="'+(apiURL + 'uploads/' + mailDetails[i].attachments)+'">'+mailDetails[i].attachments+'</a>'+
                            '</div>';
                    }
                    else{
                        showMailDetails += '<div class="mail-details-attachment"></div>';
                    }
                showMailDetails += '</li>';
            }
            $(".mail-details-list > ul").html(showMailDetails);
	    	replyMailID = mailDetails[mailDetails.length - 1].id;
    	}
    });
}

function sendToTrash(val){
	$.post(apiURL + "sendTrash.php",
    {
        emailID: replyMailID,
        sender: user
    },
    function(data, status){
    	console.log(data);
    	if(data == "true"){
    		var newlocation = "http://"+location.host + "/pramolta";
    		window.location.assign(newlocation);
    	}
    });
}

function saveToDrafts(){
	var recipient = $("#composeEmailTo").val();
	var subject = $("#composeEmailSubject").val();
	var body = $("#composeEmailBody").html();
	var sender = user;
	var file_data = $('#uploadAttachment').prop('files')[0];   
    var form_data = new FormData();                  
    form_data.append('file', file_data);
    form_data.append('recipient', recipient);
    form_data.append('subject', subject);
    form_data.append('body', body);
    form_data.append('sender', sender);
    var finalURL;
    if(newDraft == true){
    	finalURL = apiURL + "saveDraft.php";
    }
    else{
    	finalURL = apiURL + "updateDraft.php";
    	form_data.append('DraftID', DraftID);
    }
	$.ajax({
        url: finalURL,
        type: 'post',
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        success: function(data) {
            console.log("submitted + "+ data);
            if(newDraft == true){
            	if(data.success == true){
            		newDraft = false;
            	}
            }
            else{
            	console.log("data updated");
            }
            DraftID = data.mailID;
            if(data.attachments != null){
            	$(".mail-attachment").show();
            	$(".mailFileName").html(data.attachments);
            }
        }
    });
}

function saveReplyToDrafts(){
	var recipient = $("#replyEmailTo").val();
	var subject = $("#replyEmailSubject").val();
	var body = $("#replyEmailBody").html();
	var sender = user;
	var file_data = $('#uploadAttachmentReply').prop('files')[0];   
    var form_data = new FormData();                  
    form_data.append('file', file_data);
    form_data.append('recipient', recipient);
    form_data.append('subject', subject);
    form_data.append('body', body);
    form_data.append('sender', sender);
    form_data.append('emailID', replyMailID);
    form_data.append('replyMail', true);
    var finalURL;
    if(newDraft == true){
    	finalURL = apiURL + "saveDraft.php";
    }
    else{
    	finalURL = apiURL + "updateDraft.php";
    	form_data.append('DraftID', DraftID);
    }
	$.ajax({
        url: finalURL,
        type: 'post',
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        success: function(data) {
            console.log("submitted + "+ data);
            if(newDraft == true){
            	if(data.success == true){
            		newDraft = false;
            	}
            }
            else{
            	console.log("data updated");
            }
            DraftID = data.mailID;
            if(data.attachments != null){
            	$(".mail-attachment").show();
            	$(".mailFileName").html(data.attachments);
            }
        }
    });
}

function setCursorReply(){
    var el = document.getElementById("replyEmailBody");
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[0], 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
}

function replyMail(){
    var replyBodyHtml = "<br/><br/><br/><br/>On "+$(".mail-details-list > ul > li:last-child .mail-details-date").html()+", <a>"+$(".mail-details-list > ul > li:last-child  .mail-details-recipientEmail").html()+"</a> wrote:" +
        "<div class='previousMailDiv'>"+$(".mail-details-list > ul > li:last-child .mail-details-body").html()+"</div>"
	$(".mail-attachment").hide();
	$(".reply-email").show();
	$("#replyEmailTo").val($(".mail-details-list > ul > li:last-child .mail-details-recipientEmail").html());
    var replyHtml = $(".mail-details-subject").html();
    console.log(replyHtml +", " + replyHtml.substring(0,4) + ", " + replyHtml.substring(0,5));
    if(replyHtml.substring(0,4) == "Re: "){
        $("#replyEmailSubject").val("Re: " + replyHtml.substring(4,replyHtml.length));
    }
    else if(replyHtml.substring(0,5) == "Fwd: "){
        $("#replyEmailSubject").val("Re: " + replyHtml.substring(5, replyHtml.length));
    }
    else{
        $("#replyEmailSubject").val("Re: " + replyHtml);
    }
    $("#replyEmailBody").html(replyBodyHtml);
	newDraft = true;
    $(".mail-details-content").animate({ scrollTop: $(".mail-details-content").height() + 340 }, 500);
    setCursorReply();
}

function forwardMail(){
    var forwardBodyMail = "<br/><br/><br/><br/>"+
        "---------- Forwarded message ---------- <br/>"+
        "From: "+$(".mail-details-list > ul > li:last-child .mail-details-recipientName").html()+" <a>"+$(".mail-details-list > ul > li:last-child .mail-details-recipientEmail").html() +"</a><br/>"+
        "Subject: "+ $(".mail-details-subject").html() + "<br/>"+
        $(".mail-details-list > ul > li:last-child .mail-details-sender").html() + " <br/><br/><br/><div>"+ $(".mail-details-list > ul > li:last-child .mail-details-body").html() + "</div>";
	$(".mail-attachment").hide();
	$(".reply-email").show();
    var replyHtml = $(".mail-details-subject").html();
    if(replyHtml.substring(0,4) == "Re: "){
        $("#replyEmailSubject").val("Fwd: " + replyHtml.substring(4,replyHtml.length));
    }
    else if(replyHtml.substring(0,5) == "Fwd: "){
        $("#replyEmailSubject").val("Fwd: " + replyHtml.substring(5, replyHtml.length));
    }
    else{
        $("#replyEmailSubject").val("Fwd: " + replyHtml);
    }
	$("#replyEmailBody").html(forwardBodyMail);
	newDraft = true;
    $(".mail-details-content").animate({ scrollTop: $(".mail-details-content").height() + 340 }, 500);
    setCursorReply();
}

function onClickReply(){
	sendMail(true, val);
}

function uploadAttachmentFn(){
	$("#uploadAttachment").click();
}

function uploadAttachmentReplyFn(){
	$("#uploadAttachmentReply").click();
}