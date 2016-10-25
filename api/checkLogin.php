<?php
	header("Access-Control-Allow-Origin: *");
	include 'dbconfig.php';
	include 'variables.php';
	include 'functions.php';
	if($userEmail){
		$sql = "SELECT * FROM users WHERE email='$userEmail' AND password='$userPassword'";
		$result = mysqli_query($conn, $sql);
		if (mysqli_num_rows($result) > 0) {
		    while($row = mysqli_fetch_assoc($result)) {
		        $msg = array(
		    		"success" => true
		    	);
		    }
		} else {
		    $msg = array(
		    	"success" => false,
		    	"message" => "email not found"
		    );
		}
	}
	else{
		$msg = array(
	    	"success" => false,
	    	"message" => "error in login"
	    );
	}
	echo json_encode($msg);
?>