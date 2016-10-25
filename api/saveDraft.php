<?php
	header("Access-Control-Allow-Origin: *");
	include 'dbconfig.php';
	include 'variables.php';
	include 'functions.php';
	if($sender){
		$attachments = uploadFile();

		//checking mail thread is new or not
		if($isReply){
	    	$sql3 = "SELECT thread,sequence FROM mailDetails WHERE id = '$refMailID'";
		    $result3 = mysqli_query($conn, $sql3);
		    if(mysqli_num_rows($result3) > 0){
		    	while($row3 = mysqli_fetch_assoc($result3)) {
			        $thread = $row3["thread"];
			        $sequence = $row3["sequence"] + 1;
			    }
		    }
	    }
	    else{
	    	$sequence = 1;
	    	$sql3 = "SELECT DISTINCT thread FROM mailDetails";
	    	$result3 = mysqli_query($conn, $sql3);
	    	$thread = mysqli_num_rows($result3) + 1;
	    }

	    //getting sender userid
		$senderID = getUserID($sender);

	    //checking recipient in db
		if($recipient){
			$recipientArray = explode(',', $recipient);
			$mailIDArray = array();
			for($i=0;$i<count($recipientArray);$i++){
				$recpt = trim($recipientArray[$i]," ");
				$recipientID = getUserID($recpt);
				$sql2 = "INSERT INTO mailDetails (recipient, sender, subject, body, attachments, thread, sequence, created_at)
				VALUES ('$recipientID','$senderID','$subject','$body','$attachments','$thread', '$sequence', now())";
				$result2 = mysqli_query($conn, $sql2);
				$mailID = mysqli_insert_id($conn);
				array_push($mailIDArray, mysqli_insert_id($conn));
			    $sql3 = "INSERT INTO draftMail (mailID, userID)
				VALUES ('$mailID','$senderID')";
				$result3 = mysqli_query($conn, $sql3);
			}
			$msg = array(
		    	"success" => true,
		    	"mailID" => $mailIDArray,
		    	"attachments" => $attachments
		    );

		}
		else{
			$sql2 = "INSERT INTO mailDetails (recipient, sender, subject, body, attachments, thread, sequence, created_at)
			VALUES ('$recipientID','$senderID','$subject','$body','$attachments','$thread', '$sequence', now())";
			$result2 = mysqli_query($conn, $sql2);
			if ($result2) {
				$mailID = mysqli_insert_id($conn);
			    $msg = array(
			    	"success" => true,
			    	"mailID" => mysqli_insert_id($conn),
			    	"attachments" => $attachments
			    );
			    //deleting from drafts after mail sent
			    $sql3 = "INSERT INTO draftMail (mailID, userID)
				VALUES ('$mailID','$senderID')";
				$result3 = mysqli_query($conn, $sql3);
			} 
			else {
			    $msg = array(
			    	"success" => false,
			    	"message" => "error in saving draft"
			    );
			}
		}
	}
	else{
		$msg = array(
	    	"success" => false,
	    	"message" => "not enough variables"
	    );
	}
	echo json_encode($msg);
?>