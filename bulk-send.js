// Error
const errorMsg = document.getElementById("errorMsg");
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "inline";
}

function clearError() {
    errorMsg.textContent = "";
    errorMsg.style.display = "none";
}

// Table
const table = document.getElementById("previewTable");
function clearTable() {
    if (table) {
        table.innerHTML = ""; // премахва всички редове и клетки
    }
}

// Row
function validateRow(cells, rowIndex) {
    const name = cells[0].trim();
    const email = cells[1].trim();
    const message = cells[2].trim();

    const nameRegex = /^[a-zA-Zа-яА-Я\s-]{2,}$/;
    const emailRegex = /^[\w.-]+@[a-z\d.-]+\.[a-z]{2,}$/i;

    if (!nameRegex.test(name)) {
        showError(`Невалидно име на ред ${rowIndex + 1}: "${name}"`);
        return false;
    }
    clearError();
    
    if (!emailRegex.test(email)) {
        showError(`Невалиден имейл на ред ${rowIndex + 1}: "${email}"`);
        return false;
    }
    clearError();

    if (message.length < 1 || message.length > 200) {
        showError(`Пожеланието на ред ${rowIndex + 1} е празно или твърде дълго`);
        return false;
    }
    clearError();

    return true;
}

// Table Pagination
let currentPage = 1;
const rowsPerPage = 6;
let allRows = []; // тук ще са всички редове от CSV

function renderTablePage(page) {
    currentPage = page;
    const tbody = document.querySelector("#previewTable tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(allRows)) return;

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageRows = allRows.slice(start, end);

    if (!Array.isArray(pageRows)) return;

    pageRows.forEach(cells => {
        if (!Array.isArray(cells)) return;
        const row = document.createElement("tr");
        cells.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    renderPaginationButtons();
}

function renderPaginationButtons() {
    const pageCount = Math.ceil(allRows.length / rowsPerPage);
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    if (pageCount <= 10) {
        for (let i = 1; i <= pageCount; i++) {
            addPageBtn(i);
        }
    } else {
        let pages = [];

        // Винаги първа страница
        pages.push(1);

        // Ако текущата страница е след 4, добави ...
        if (currentPage > 4) pages.push("...");

        // Показвай 2 преди и 2 след текущата страница
        let start = Math.max(2, currentPage - 2);
        let end = Math.min(pageCount - 1, currentPage + 2);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Ако текущата страница е преди последните 3, добави ...
        if (currentPage < pageCount - 3) pages.push("...");

        // Винаги последна страница
        pages.push(pageCount);

        // Рендерирай бутоните и многоточието
        pages.forEach((p, idx) => {
            if (p === "...") {
                // Не добавяй многоточие два пъти поред
                if (idx === 0 || pages[idx - 1] === "...") return;
                const span = document.createElement("span");
                span.textContent = "...";
                span.style.margin = "0 4px";
                container.appendChild(span);
            } else {
                addPageBtn(p);
            }
        });
    }

    function addPageBtn(i) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.disabled = i === currentPage;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = i;
            renderTablePage(currentPage);
        });
        container.appendChild(btn);
    }
}


// Template
function getSelectedTemplate() {
    const selected = document.querySelector('input[name="template"]:checked');
    return selected ? selected.value : null;
}

// Cards viewer
let currentIndex = 0;
let cardsData = [];

function generateCardHTML(name, message) {
    const template = getSelectedTemplate();
    const backgroundStyle = template ? `background-image: url('templates/${template}');` : "";

    return `
        <div class="card" id="card" style="${backgroundStyle}">
        <h2>${message}</h2>
        </div>
    `;
}

function showCard(index) {
  const container = document.getElementById("singleCardContainer");
  const info = document.getElementById("cardIndexInfo");

  if (cardsData.length === 0) {
    container.innerHTML = "<p>Няма картички.</p>";
    info.textContent = "";
    return;
  }

  const [name, email, message] = cardsData[index];
  container.innerHTML = generateCardHTML(name.trim(), message.trim().replaceAll('"', ''));
  info.textContent = `Картичка ${index + 1} от ${cardsData.length}`;
}

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    showCard(currentIndex);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentIndex < cardsData.length - 1) {
    currentIndex++;
    showCard(currentIndex);
  }
});

const parsedRows = [];
// main code
document.getElementById('csvFile').addEventListener('change', function(e) {
    clearTable();
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
        showError("Моля изберете CSV файл.");
        return;
    }
    clearError();

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.trim().split("\n");
        const header = rows[0].trim().replace(/^\uFEFF/, '');

        if (header !== "име,имейл,пожелание") {
            showError("Заглавният ред трябва да е: име,имейл,пожелание");
            return;
        }
        clearError();

        // Проверка за всеки ред
        
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(",").map(c => c.trim());
            if (validateRow(cells, i)) {
                parsedRows.push({ name: cells[0], email: cells[1], message: cells[2] });
            }
        }
        
        addErrorFrame();
        cardsData = rows.slice(1).map(row => row.split(","));
        currentIndex = 0;
        showCard(currentIndex);

        allRows = rows.slice(1).map(row => row.split(",").map(cell => cell.trim()));
        // Добави header на таблицата
        table.innerHTML = "<thead><tr><th>Име</th><th>Имейл</th><th>Пожелание</th></tr></thead><tbody></tbody>";
        renderTablePage(1);
        showStep(2);
    };
    
    reader.readAsText(file);
});

document.querySelectorAll('input[name="template"]').forEach(radio => {
    radio.addEventListener("change", () => {
        showCard(currentIndex); // обновява текущата картичка с новия фон
    });
});

function addErrorFrame() {
    const fileInput = document.getElementById("csvFile");

    if (!fileInput.files.length || parsedRows.length === 0) {
        // Добави червена рамка
        fileInput.classList.add("file-error");

        // Покажи съобщение
        showError("Моля, заредете валиден CSV файл преди да изпратите картички.");
        return;
    }

    fileInput.classList.remove("file-error");
}

document.getElementById("sendAllBtn").addEventListener("click", () => {
    addErrorFrame();

    // Изпращай всички
    sendAllCards();
});

let newCurrentIndex = 0;
let newCardsData = [];

async function sendAllCards() {
  const total = parsedRows.length;
  if (total === 0) return;

  // Покажи прогрес бара
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  progressContainer.style.display = "block";
  progressBar.value = 0;
  progressBar.max = total;
  progressText.textContent = `0% изпратени`;

  let successCount = 0;
	
  currentIndex = 0;
  showCard(0);
  for (let i = 0; i < total; i++) {
    const recipient = parsedRows[i];

    cardsData = [[recipient.name, recipient.email, recipient.message]];
    showCard(currentIndex);

    await new Promise(r => setTimeout(r, 500));

    const canvas = await html2canvas(document.querySelector("#card"));
    const imgData = canvas.toDataURL('image/png');

    if (!imgData || imgData.length < 1000) {
      console.error(`⚠️ Грешка при създаване на картичката за ${recipient.email}`);
      continue;
    }

    await fetch('send_card_email.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imgData,
        email: recipient.email,
        name: recipient.name
      })
    })
    .then(res => res.text())
    .then(msg => {
      console.log(`✅ ${recipient.email}: ${msg}`);
      successCount++;
    })
    .catch(err => console.error(`❌ ${recipient.email}:`, err));

    // Обнови прогреса
    progressBar.value = i + 1;
    const percent = Math.round(((i + 1) / total) * 100);
    progressText.textContent = `${percent}% изпратени (${i + 1}/${total})`;
  }
  
  await new Promise(r => setTimeout(r, 300));
  alert(`✅ Изпратени успешно: ${successCount}/${total}`);
  progressText.textContent += " ✅ Завършено";
}

function showStep(step) {
    document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById('step' + step);
    if (section) {
        section.classList.add('active');
    }
    document.getElementById('sendAllBtn').style.display = (step === 3) ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    // Назад от стъпка 2 към 1
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', function() {
            showStep(1);
        });
    }

    // Продължи от стъпка 2 към 3
    const toStep3Btn = document.getElementById('toStep3Btn');
    if (toStep3Btn) {
        toStep3Btn.addEventListener('click', function() {
            showStep(3);
        });
    }

    // Назад от стъпка 3 към 2
    const backToStep2Btn = document.getElementById('backToStep2Btn');
    if (backToStep2Btn) {
        backToStep2Btn.addEventListener('click', function() {
            showStep(2);
        });
    }
});