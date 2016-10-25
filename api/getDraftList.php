<?php
	header("Access-Control-Allow-Origin: *");
	include 'dbconfig.php';
	include 'variables.php';
	include 'functions.php';

	if($userEmail){
		$userEmailID = getUserID($userEmail);
		$sql = "SELECT * FROM mailDetails WHERE id IN (SELECT mailID FROM draftMail WHERE userID = '$userEmailID') ORDER BY created_at DESC";
		$result = mysqli_query($conn, $sql);
		if(mysqli_num_rows($result) > 0) {
			$msg = array();
			$threadLength = 0;
			$threadArray = array();
		    while($row = mysqli_fetch_assoc($result)) {
		    	$threadNo = $row["thread"];
		    	$flag = 0;
		    	for($i=0;$i<$threadLength;$i++){
		    		if($threadArray[$i] == $threadNo){
		    			$flag = 1;
		    			break;
		    		}
		    	}
		    	if($flag == 1){
		    		continue;
		    	}
		    	else{
		    		$threadLength++;
					array_push($threadArray, $row["thread"]);
		    	}
		    	$sql1 = "SELECT * FROM trashMail WHERE threadNo = '$threadNo' AND userID = '$userEmailID'";
    			$result1 = mysqli_query($conn, $sql1);
		    	if(mysqli_num_rows($result1) > 0){
		    		continue;
		    	}
		    	$mailCount = 0;
		    	$draftCount = 0;
		    	$mailAttachments = "";
		    	$draftMail = false;
		    	$lastMail = false;
		    	$sql1 = "SELECT * FROM mailDetails WHERE thread='$threadNo' AND (recipient = '$userEmailID' OR sender = '$userEmailID') ORDER BY sequence DESC";
		    	$result1 = mysqli_query($conn, $sql1);
		    	if(mysqli_num_rows($result1) > 0){
		    		$sequenceLength = 0;
		    		$sequenceArray = array();
		    		$senderNameArray = array();
		    		while($row1 = mysqli_fetch_assoc($result1)) {
		    			$tempMailID = $row1["id"];
		    			$sql2 = "SELECT * FROM draftMail WHERE mailID = '$tempMailID' AND userID != '$userEmailID'";
		    			$result2 = mysqli_query($conn, $sql2);
				    	if(mysqli_num_rows($result2) > 0){
				    		continue;
				    	}
		    			$sequenceNo= $row1["sequence"];
	    				if($sequenceLength == 0){
	    					$mailID = $row1["id"];
	    				}
	    				$flag1 = 0;
	    				for($i=0;$i<$sequenceLength;$i++){
				    		if($sequenceArray[$i] == $sequenceNo){
				    			$flag1 = 1;
				    			break;
				    		}
				    	}
				    	if($flag1 == 1){
				    		continue;
				    	}
				    	else{
				    		$sequenceLength++;
							array_push($sequenceArray, $row1["sequence"]);
				    	}
				    	$mailCount++;
				    	$tempName = getUserName($row1["recipient"]);
	    				if($userEmailID == $row1["recipient"]){
	    					$tempName = "me";
	    				}
	    				array_push($senderNameArray, $tempName); 
	    				$sql2 = "SELECT * FROM draftMail WHERE mailID = '$tempMailID' AND userID = '$userEmailID'";
		    			$result2 = mysqli_query($conn, $sql2);
				    	if(mysqli_num_rows($result2) > 0){
				    		$draftCount++;
				    	}
				    	if($lastMail == false && $row1["sender"] == $userEmailID){
	    					$lastMail = true;
	    					$mailSubject = $row1["subject"];
	    					$mailBody = strip_tags($row1["body"]);
	    					$mailTime = $row1["created_at"];
	    				}
	    				if($row1["attachments"] != ""){
	    					$mailAttachments = $row1["attachments"];
	    				}
		    		}
		    	}
		    	if($lastMail == false){
		    		continue;
		    	}
		    	$temp = array(
		        	"id" => $mailID,
		        	"recipient" => $senderNameArray,
		        	"subject" => $mailSubject,
		        	"body" => $mailBody,
		        	"time" => $mailTime,
		        	"attachments" => $mailAttachments,
		        	"mailCount" => $mailCount,
		        	"draftCount" => $draftCount
		        );
		        array_push($msg,$temp);
		    }
		} 
		else {
		   	$msg = array(
		    	"success" => false,
		    	"message" => "no inbox"
		    );
		}
	}
	else{
		$msg = array(
	    	"success" => false,
	    	"message" => "no email"
	    );
	}
	echo json_encode($msg);
?>