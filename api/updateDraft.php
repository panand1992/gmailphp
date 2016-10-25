<?php
	header("Access-Control-Allow-Origin: *");
	include 'dbconfig.php';
	include 'variables.php';
	include 'functions.php';
	if($sender){
		$attachments = uploadFile();
		$mailIDArray = array();

		//getting sender userid
		$senderID = getUserID($sender);

		//checking recipient in db
		if($recipient){
			$recipientArray = explode(',', $recipient);
			$refMailIDArray = explode(',', $draftID);
			if(count($recipientArray) == count($refMailIDArray)){
				for($i=0;$i<count($recipientArray);$i++){
					$recpt = trim($recipientArray[$i]," ");
					$recipientID = getUserID($recpt);
					$refMID = trim($refMailIDArray[$i]," ");
					$sql = "UPDATE mailDetails SET recipient='$recipientID', subject='$subject',
						body='$body', attachments='$attachments', created_at=now()
						WHERE id='$refMID'";
					$result = mysqli_query($conn, $sql);
					array_push($mailIDArray, intval($refMID));
				}
			}
			else{
				for($i=0;$i<count($refMailIDArray);$i++){
					$recpt = trim($recipientArray[$i]," ");
					$recipientID = getUserID($recpt);
					$refMID = trim($refMailIDArray[$i]," ");
					$sql = "UPDATE mailDetails SET recipient='$recipientID', subject='$subject',
						body='$body', attachments='$attachments', created_at=now()
						WHERE id='$refMID'";
					$result = mysqli_query($conn, $sql);
					array_push($mailIDArray, intval($refMID));
				}
				$sql2 = "SELECT thread,sequence FROM mailDetails WHERE id = '$refMID'";
				$result2 = mysqli_query($conn, $sql2);
				if(mysqli_num_rows($result2) > 0){
			    	while($row2 = mysqli_fetch_assoc($result2)) {
				        $thread = $row2["thread"];
				        $sequence = $row2["sequence"];
				    }
			    }
				for($i=count($refMailIDArray);$i<count($recipientArray);$i++){
					$recpt = trim($recipientArray[$i]," ");
					$recipientID = getUserID($recpt);
					$sql = "INSERT INTO mailDetails (recipient, sender, subject, body, attachments, thread, sequence, created_at)
						VALUES ('$recipientID','$senderID','$subject','$body','$attachments','$thread', '$sequence', now())";
					$result = mysqli_query($conn, $sql);
					$mailID = mysqli_insert_id($conn);
					array_push($mailIDArray, intval($mailID));
				    $sql1 = "INSERT INTO draftMail (mailID, userID)
					VALUES ('$mailID','$senderID')";
					$result1 = mysqli_query($conn, $sql1);
				}
			}
		}
		else{
			$sql2 = "UPDATE mailDetails SET recipient='$recipientID', subject='$subject',
				body='$body', attachments='$attachments', created_at=now()
				WHERE id='$draftID'";
			$result2 = mysqli_query($conn, $sql2);
			array_push($mailIDArray, intval($draftID));
		}

	    $msg = array(
	    	"success" => true,
	    	"attachments" => $attachments,
	    	"mailID" => $mailIDArray
	    );
	}
	else{
		$msg = array(
	    	"success" => false,
	    	"message" => "not enough variables"
	    );
	}
	echo json_encode($msg);
?>