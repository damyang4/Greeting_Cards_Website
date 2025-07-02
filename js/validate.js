function validateLogin() {
    const username = document.querySelector('[name="username"]').value.trim();
    const password = document.querySelector('[name="password"]').value;

    if (!username || !password) {
        alert("Моля, попълнете всички полета.");
        return false;
    }
    return true;
}

function validateRegister() {
    const username = document.querySelector('[name="username"]').value.trim();
    const email = document.querySelector('[name="email"]').value.trim();
    const password = document.querySelector('[name="password"]').value;
    const confirm = document.querySelector('[name="confirm_password"]').value;

    if (!username || !email || !password || !confirm) {
        alert("Всички полета са задължителни.");
        return false;
    }

    if (password !== confirm) {
        alert("Паролите не съвпадат.");
        return false;
    }

    if (password.length < 6) {
        alert("Паролата трябва да е поне 6 символа.");
        return false;
    }

    return true;
}
