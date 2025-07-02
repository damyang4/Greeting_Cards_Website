<?php
$host = 'localhost';
$db = 'user_auth';
$user = 'root';
$pass = '';

// Създаване на връзка
$conn = new mysqli($host, $user, $pass, $db);

// Проверка
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>