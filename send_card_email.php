<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['image'], $data['email'], $data['name'])) {
    http_response_code(400);
    echo "Липсват данни";
    exit;
}

$imageData = $data['image'];
$email = $data['email'];
$name = $data['name'];

// Премахваме префикса на base64 данните
$imageData = preg_replace('#^data:image/\w+;base64,#i', '', $imageData);
$imageData = base64_decode($imageData);
if ($imageData === false) {
    http_response_code(400);
    echo "Грешка при декодиране на изображението!";
    exit;
}

// Създаваме PHPMailer обект
$mail = new PHPMailer(true);
$mail->SMTPOptions = [
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true
    ]
];
$mail->SMTPDebug = 2;
$mail->Debugoutput = 'html';
try {
    // SMTP конфигурация (пример с Gmail)
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'uebkarticki@gmail.com';
    $mail->Password = 'jyjp bmet zclz ipiu'; // app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->setFrom('uebkarticki@gmail.com', 'Karticki');
    $mail->addAddress($email, $name);

    $mail->CharSet = 'UTF-8';
    $mail->Subject = "Картичка за теб, $name";
    $mail->Body = "Здравей, $name! Виж прикачената картичка.";

    // Прикачване на изображението директно от паметта (без запис на файл)
    $mail->addStringAttachment($imageData, 'card.png', 'base64', 'image/png');

    $mail->send();
    echo "Имейлът беше изпратен успешно до $email.";
} catch (Exception $e) {
    http_response_code(500);
    echo "Грешка при изпращане на имейл: {$mail->ErrorInfo}";
}
?>
