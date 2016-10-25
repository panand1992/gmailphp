<?php
	function getUserID($val){
		$userID = "";
		$sql = "SELECT * FROM users WHERE email = '$val'";
		$result = mysqli_query($GLOBALS['conn'], $sql);
		if (mysqli_num_rows($result) > 0) {
			while($row = mysqli_fetch_assoc($result)) {
		        $userID = $row["id"];
		    }
		}
		return $userID; 
	}

	function getUserName($val){
		$userName = "";
		$sql = "SELECT * FROM users WHERE id = '$val'";
		$result = mysqli_query($GLOBALS['conn'], $sql);
		if (mysqli_num_rows($result) > 0) {
			while($row = mysqli_fetch_assoc($result)) {
		        $userName = $row["name"];
		    }
		}
		return $userName; 
	}

	function getUserEmail($val){
		$userEmail = "";
		$sql = "SELECT * FROM users WHERE id = '$val'";
		$result = mysqli_query($GLOBALS['conn'], $sql);
		if (mysqli_num_rows($result) > 0) {
			while($row = mysqli_fetch_assoc($result)) {
		        $userEmail = $row["email"];
		    }
		}
		return $userEmail; 
	}

	function uploadFile(){
		if (0 < $_FILES['file']['error'] ) {
	        $attachments = null;
	    }
	    else {
	        move_uploaded_file($_FILES['file']['tmp_name'], 'uploads/' . $_FILES['file']['name']);
	    	$attachments = $_FILES['file']['name'];
	    }
	   	return $attachments;
	}
?>