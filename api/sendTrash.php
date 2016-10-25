<?php
	header("Access-Control-Allow-Origin: *");
	include 'dbconfig.php';
	include 'variables.php';
	include 'functions.php';

	if($sender){
		$userID = getUserID($sender);
		$sql = "SELECT thread FROM mailDetails WHERE id = '$refMailID'";
		$result = mysqli_query($conn, $sql);
		if(mysqli_num_rows($result) > 0){
			while($row = mysqli_fetch_assoc($result)){
				$threadNo = $row["thread"];
				$sql1 = "INSERT INTO trashMail(threadNo, userID)
				VALUES ('$threadNo','$userID')";
				$result1 = mysqli_query($conn, $sql1);
				if ($result1) {
				    $msg = array(
				    	"success" => true
				    );
				} else {
				    $msg = array(
				    	"success" => false,
				    	"message" => "error in deleting mail"
				    );
				}
			}
		}
		else{
			$msg = array(
		    	"success" => false,
		    	"message" => "wrong email data"
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