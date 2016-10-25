<?php
	header("Access-Control-Allow-Origin: *");
	include 'dbconfig.php';
	include 'variables.php';
	include 'functions.php';

	if($refMailID){
		$userEmailID = getUserID($sender);
		$sql = "SELECT * FROM mailDetails WHERE id='$refMailID'";
		$result = mysqli_query($conn, $sql);
		if (mysqli_num_rows($result) > 0) {
			$msg = array();
		    while($row = mysqli_fetch_assoc($result)) {
		    	$threadNo = $row["thread"];
		    	$sequenceNo = $row["sequence"];
		    	for($i=1;$i<=$sequenceNo;$i++){
		    		$sql1 = "SELECT * FROM mailDetails WHERE thread = '$threadNo' AND sequence = '$i' AND (recipient = '$userEmailID' OR sender = '$userEmailID')";
			    	$result1 = mysqli_query($conn, $sql1);
			    	if(mysqli_num_rows($result1) > 0){
			    		while($row1 = mysqli_fetch_assoc($result1)){
			    			$emailSender = $row1["sender"];
					    	$senderName = getUserName($emailSender);
					    	$senderEmail = getUserEmail($emailSender);
			    			$recipient = $row1["recipient"];
					    	$recipientEmail = getUserEmail($recipient);
			    			$checkMail = strcmp($sender,$recipientEmail);
					        if(!$checkMail){
					        	$sql2 = "SELECT * FROM readMail WHERE mailID = $refMailID AND userID = $recipient";
						    	$result2 = mysqli_query($conn, $sql2);
						    	if(mysqli_num_rows($result2) == 0){
						    		$sql3 = "INSERT INTO readMail(mailID, userID)
										VALUES ('$refMailID','$recipient')";
									$result3 = mysqli_query($conn, $sql3);
						    	}
					        }
					        $recptNameArray = array();
			    			$recptEmailArray = array();
			    			$sql4 = "SELECT * FROM mailDetails WHERE thread = '$threadNo' AND sequence = '$i' AND sender = '$emailSender'";
					    	$result4 = mysqli_query($conn, $sql4);
					    	if(mysqli_num_rows($result4) > 0){
					    		while($row4 = mysqli_fetch_assoc($result4)){
					    			$recipient = $row4["recipient"];
							    	$recipientName = getUserName($recipient);
							    	$recipientEmail = getUserEmail($recipient);
					    			array_push($recptNameArray, $recipientName);
					    			array_push($recptEmailArray, $recipientEmail);
					    		}
					    	}
					    	$temp = array(
					        	"id" => $row1["id"],
					        	"senderName" => $senderName,
					        	"senderEmail" => $senderEmail,
					        	"recipientName" => $recptNameArray,
					        	"recipientEmail" => $recptEmailArray, 
					        	"subject" => $row1["subject"],
					        	"body" => $row1["body"],
					        	"time" => $row1["created_at"],
					        	"attachments" => $row1["attachments"]
					        );
					        array_push($msg, $temp);
			    		}
			    	}
		    	}
		    }
		} 
		else {
		    $msg = array(
		    	"success" => false,
		    	"message" => "no mail"
		    );
		}
	}
	else{
		$msg = array(
	    	"success" => false,
	    	"message" => "no mail id"
	    );
	}
	echo json_encode($msg);
?>