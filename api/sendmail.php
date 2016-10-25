<?php
	header("Access-Control-Allow-Origin: *");
	include 'dbconfig.php';
	include 'variables.php';
	include 'functions.php';

	if($sender){
		$attachments = uploadFile();

	    $senderID = getUserID($sender);

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
				$sql1 = "DELETE FROM draftMail WHERE mailID = '$refMID'";
	    		$result1 = mysqli_query($conn, $sql1);
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
				$sql1 = "DELETE FROM draftMail WHERE mailID = '$refMID'";
	    		$result1 = mysqli_query($conn, $sql1);
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
			}
		}
		$msg = array(
	    	"success" => true
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