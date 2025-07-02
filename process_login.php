<?php
require 'config.php';
session_start();

$username = $_POST['username'];
$password = $_POST['password'];

// Извличане на потребителя
$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
    $_SESSION['user_id']  = $user['id'];
    $_SESSION['username'] = $user['username'];
    header('Location: homepage.html');  
    exit;
} else {
        echo "Грешна парола.";
    }
} else {
    echo "Потребителят не съществува.";
}
$conn->close();
?>