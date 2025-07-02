<?php
require 'config.php';

$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];

// Хеширане на паролата
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Проверка дали потребителят съществува
$sql_check = "SELECT * FROM users WHERE username = ? OR email = ?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo "Потребител с това име или имейл вече съществува.";
} else {
    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $username, $email, $hashed_password);

    if ($stmt->execute()) {
        echo "Регистрацията е успешна. <a href='login.php'>Влез</a>";
    } else {
        echo "Грешка при регистрацията.";
    }
}
$conn->close();
?>