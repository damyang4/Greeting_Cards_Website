<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Вход</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="custom_style.css">
</head>
<body class="bg-light">
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card shadow p-4" style="width: 100%; max-width: 400px;">
            <h3 class="mb-3 text-center">Вход</h3>
            <form action="process_login.php" method="POST">
                <div class="mb-3">
                    <label for="username" class="form-label">Потребителско име</label>
                    <input type="text" class="form-control" id="username" name="username" placeholder="Въведи име" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Парола</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="Въведи парола" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Влез</button>
                <div class="text-center mt-3">
                    <a href="register.php">Нямаш акаунт?</a>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
