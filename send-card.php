<?php  //  send-card.php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405); exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$to      = $data['to']      ?? '';
$subject = $data['subject'] ?? 'Card';
$file    = $data['fileName'] ?? 'card.png';
$base64  = $data['data']    ?? '';

if (!$to || !$base64){
  http_response_code(400);
  echo json_encode(['error'=>'missing params']); exit;
}

/* === PHPMailer === */
require __DIR__.'/PHPMailer/src/Exception.php';
require __DIR__.'/PHPMailer/src/PHPMailer.php';
require __DIR__.'/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);
try{
  $mail->isSMTP();
  $mail->Host       = 'smtp.gmail.com';
  $mail->SMTPAuth   = true;
  $mail->Username = 'uebkarticki@gmail.com';
  $mail->Password = 'jyjp bmet zclz ipiu'; // app password 
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port       = 587;

  $mail->setFrom('uebkarticki@gmail.com', 'Karticki');
  $mail->addAddress($to);
  $mail->Subject = $subject;
  $mail->Body    = 'Вашата персонална картичка е приложена. 🎉';

  // прикачване
  $mail->addStringAttachment(base64_decode($base64), $file, 'base64', 'image/png');

  $mail->send();
  echo json_encode(['ok'=>true]);
} catch (Exception $e){
  http_response_code(500);
  echo json_encode(['error'=>$mail->ErrorInfo]);
}
