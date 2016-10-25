<?php
	$servername = "localhost:8889";
	$username = "vicky1992";
	$password = "panand1992";
	$dbname = "pramolta";

	// Create connection
	$conn = mysqli_connect($servername, $username, $password, $dbname);
	// Check connection
	if (!$conn) {
	    die("Connection failed: " . mysqli_connect_error());
	} 
?>