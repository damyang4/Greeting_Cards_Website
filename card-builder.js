/* ===== Card Builder ===== */
(function(){
  /*  ---- DOM refs -- */
  const preview    = document.getElementById('cardPreview');
  const txt        = document.getElementById('cardText');
  const img        = document.getElementById('cardImg');
  const statusDiv = document.getElementById('bulkStatus');

  /* inputs */
  const msgInput   = document.getElementById('msgInput');
  const fontSelect = document.getElementById('fontSelect');
  const fontSize   = document.getElementById('fontSize');
  const bgColor    = document.getElementById('bgColor');
  const imgSelect  = document.getElementById('imgSelect');
  const cardW      = document.getElementById('cardW');
  const cardH      = document.getElementById('cardH');

  /* ---- helpers ---- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---- live bindings ---- */
  msgInput.addEventListener('input', e => {
    txt.textContent = e.target.value || ' ';
  });

  fontSelect.addEventListener('change', e => {
    txt.style.fontFamily = e.target.value;
  });

  fontSize.addEventListener('input', e => {
    txt.style.fontSize = Math.round(e.target.value) + 'px';
  });

  document.querySelectorAll('.pos-btns button').forEach(btn => {
    btn.addEventListener('click', () => {
      const pos = btn.dataset.pos;
      txt.style.top        = (pos === 'top')    ? '10%'  :
                             (pos === 'center') ? '50%'  : '85%';
      txt.style.left       = '50%';
      txt.style.transform  = 'translate(-50%,-50%)';
    });
  });

  bgColor.addEventListener('input', e => {
    preview.style.background = e.target.value;
  });

  imgSelect.addEventListener('change', e => {
    if (e.target.value) {
      img.src = e.target.value;
      img.dataset.origsrc = e.target.value;
      img.classList.remove('hidden');
    } else {
      img.classList.add('hidden');
    }
  });

  document.getElementById('imgSize').addEventListener('input', e => {
    img.style.width  = e.target.value + '%';
    img.style.height = 'auto';
  });

 /* ---- card resize ---- */
    let skipNextRO = false;
  function updateSize(){
    preview.style.width  = cardW.value + 'px';
    preview.style.height = cardH.value + 'px';
    skipNextRO = true; 
  }
  updateSize();
  [cardW, cardH].forEach(inp => {

    inp.addEventListener('change', updateSize);
  
    
    inp.addEventListener('keydown', e=>{
      if (e.key === 'Enter'){
        updateSize();
        inp.blur();                
      }
    });
  });
  

  /* Синхронизираме input-ите, когато картичката се влачи с мишката */
  const ro = new ResizeObserver(entries => {
  if (skipNextRO) {                     
       skipNextRO = false;
        return;                             
      }
    
      const { width, height } = entries[0].contentRect;
      cardW.value = Math.round(width);      
    cardH.value = Math.round(height);
    });
    ro.observe(preview);

  /* ---- drag card---- */
  function makeDraggable(el){
    let shiftX, shiftY;
    el.addEventListener('mousedown', startDrag);
    el.addEventListener('touchstart', startDrag, {passive:false});

    function startDrag(e){
      e.preventDefault();
      const evt   = e.touches ? e.touches[0] : e;
      const rect  = el.getBoundingClientRect();
      shiftX      = evt.clientX - rect.left;
      shiftY      = evt.clientY - rect.top;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   stopDrag);
      document.addEventListener('touchmove', onMove, {passive:false});
      document.addEventListener('touchend',  stopDrag);
    }
    function onMove(e){
      e.preventDefault();
      const evt   = e.touches ? e.touches[0] : e;
      const box   = preview.getBoundingClientRect();
      const left  = evt.clientX - box.left - shiftX;
      const top   = evt.clientY - box.top  - shiftY;
      el.style.left = left + 'px';
      el.style.top  = top  + 'px';
      if (el.style.transform){
        el.style.transform = '';
      }
    }
    function stopDrag(){
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   stopDrag);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  stopDrag);
    }
  }

  /* ---- stickers ---- */
  let currentSticker  = null;
  const sizeBlock     = document.getElementById('stickerSizeBlock');
  const sizeSlider    = document.getElementById('stickerSize');

  function selectSticker(el){
    document.querySelectorAll('.sticker-el.selected')
            .forEach(stk => stk.classList.remove('selected'));

    currentSticker = el;
    currentSticker.classList.add('selected');
    const w          = parseInt(currentSticker.style.width) || currentSticker.offsetWidth;
    sizeSlider.value = Math.round((w / 80) * 100);
    sizeBlock.style.display = 'flex';
  }

  document.querySelectorAll('#stickerGallery img').forEach(thumb => {
    thumb.addEventListener('click', e => {
      e.stopPropagation();
      const src = thumb.dataset.src;
      const stk = document.createElement('img');
      stk.src   = src;
      stk.className = 'sticker-el';
      stk.style.left  = '50%';
      stk.style.top   = '50%';
      stk.style.transform = 'translate(-50%,-50%)';
      stk.style.width = '80px';
      preview.appendChild(stk);
      makeDraggable(stk);

      stk.addEventListener('click', ev => {
        ev.stopPropagation();
        selectSticker(stk);
      });

      selectSticker(stk);
    });
  });

  sizeSlider.addEventListener('input', () => {
    if (!currentSticker) return;
    const pct = sizeSlider.value;
    currentSticker.style.width  = (pct * 0.8) + 'px';
    currentSticker.style.height = 'auto';
  });

  preview.addEventListener('click', () => {
    if (currentSticker){
      currentSticker.classList.remove('selected');
      currentSticker = null;
      sizeBlock.style.display = 'none';
    }
  });

  document.getElementById('delStickerBtn')
        .addEventListener('click', () => {
          if (!currentSticker) return;
          currentSticker.remove();
          currentSticker = null;
          sizeBlock.style.display = 'none';
        });


/* ==  download as png ===== */

  /* convert each img*/
async function inlineImages(node){
  const imgs = node.querySelectorAll('img');
  for (const el of imgs){
    if (el.src.startsWith('data:')) continue;    

    if (!el.dataset.origsrc) {
         el.dataset.origsrc = el.src;
        }
      
    await new Promise(res => {
      if (el.complete) return res();            

      el.onload  = () => res();
      el.onerror = () => res();                 
    });

    const blob   = await fetch(el.src).then(r => r.blob());
    const reader = new FileReader();
    await new Promise(r=>{
      reader.onloadend = () => { el.src = reader.result; r(); };
      reader.readAsDataURL(blob);
    });
  }
}

/* ==== capture entire card – no cropping ==== */
async function captureCard(format = 'png', filename = 'card', download = true)  {
  await inlineImages(preview);
  const oldOverflow = preview.style.overflow;
  preview.style.overflow = 'hidden';

  const options = {
    quality : 1,
    width   : preview.offsetWidth,  
    height  : preview.offsetHeight,  
    style   : { overflow: 'hidden', margin:'0' },
    cacheBust: true  
  };

  const blob = await domtoimage.toBlob(preview, options);
  preview.querySelectorAll('img').forEach(el=>{
    if (el.dataset.origsrc) el.src = el.dataset.origsrc;
    });

  preview.style.overflow = oldOverflow;

  
  if (download) {
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.png`);
  }
  return { blob, mime: 'image/png' };  
}



/* ==== converts image to base64 ==== */
function blobToBase64(blob){
  return new Promise(r=>{
    const fr = new FileReader();
    fr.onload = () => r(fr.result.split(',')[1]);   
    fr.readAsDataURL(blob);
  });
}


/* ==== send one card ==== */
async function sendCard(to, subject, blob){
  const data = await blobToBase64(blob);
  const fileName = `card-${Date.now()}.png`;

  const res = await fetch('http://localhost:3000/send-card', {      // absolute URL
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ to, subject, fileName, mime:'image/png', data })
  });
  if (!res.ok) throw new Error(await res.text());
}


/* ==== download ==== */
  function triggerDownload(url, name){
    const a = document.createElement('a');
    a.href        = url;
    a.download    = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---- Save button (single card) ---- */
  document.getElementById('saveBtn')
        .addEventListener('click', () => captureCard('png', `card-${Date.now()}`, true));



/* ====  CSV import  (mass send)  == */
  document.getElementById('csvInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      async complete(res) {                     
        if (!res.data.length){
          alert('CSV е празен');
          return;
        }
    
        preview.style.visibility = 'visible';
    
        for (let idx = 0; idx < res.data.length; idx++){
          const row = res.data[idx];
    
          /* ---------- CSV ---------- */
          msgInput.value  = row.message || '';
          msgInput.dispatchEvent(new Event('input', { bubbles: true }));

          fontSelect.value = row.font || fontSelect.value;
          fontSelect.dispatchEvent(new Event('change'));

          txt.style.fontFamily = `"${fontSelect.value}"`; 
    
          fontSize.value = row.fontSize || fontSize.value;
          fontSize.dispatchEvent(new Event('input'));
    
          bgColor.value = row.bgColor || bgColor.value;
          bgColor.dispatchEvent(new Event('input'));
    
          /* ---------- size ---------- */
          if (row.cardW) cardW.value = row.cardW;
          if (row.cardH) cardH.value = row.cardH;
          updateSize();
    
          /* Декорация */
          const imgPath = (row.image || '').trim();
          imgSelect.value = imgPath;
          imgSelect.dispatchEvent(new Event('change'));

          /* Image size */
          if (row.imgSize){
            imgSize.value = row.imgSize;                         // ← new
            imgSize.dispatchEvent(new Event('input'));           // uses existing handler
          }
    
          /* ---------- text position ---------- */
          if (row.pos){
            txt.style.top  = row.pos;
            txt.style.left = '50%';
            txt.style.transform = 'translate(-50%,-50%)';
          }
    
          /* ---------stickers ---------- */
            document.querySelectorAll('.sticker-el').forEach(s => s.remove());

            if (row.stickers){
              row.stickers.split(';').forEach(entry => {
                const raw = entry.trim();
                if (!raw) return;

                /* split into path and the coord part */
                let [path, coord = ''] = raw.split('@');
                path = path.trim();

                const [xStr='', yStr='', wStr=''] = coord.split(',');
                const hasPos  = xStr && yStr;
                const hasSize = wStr.trim() !== '';

                const stk = document.createElement('img');
                stk.src   = path.startsWith('img/') ? path : 'img/' + path;
                stk.className = 'sticker-el';

                /* --- position --- */
                let left = '50%', top = '50%';
                if (hasPos){
                  left = xStr.trim();  if (!left.endsWith('%')) left += 'px';
                  top  = yStr.trim();  if (!top .endsWith('%')) top  += 'px';
                  stk.style.transform = '';              // no centring offset
                } else {
                  stk.style.transform = 'translate(-50%,-50%)';
                }
                stk.style.left = left;
                stk.style.top  = top;

                /* --- sticker size --- */
                if (hasSize){
                  let w = wStr.trim();
                  if (!w.endsWith('%') && !w.endsWith('px')) w += 'px';
                  stk.style.width  = w;
                  stk.style.height = 'auto';
                } else {
                  stk.style.width = '80px';              
                }

                preview.appendChild(stk);
                makeDraggable(stk);
              });
            }

    
          /* -------- 6. capture & SEND ---------- */
          await sleep(100);                       // tiny pause for render
          const { blob } = await captureCard('png', `card-${idx+1}`, false);
    
          try {
            await sendCard(
              row.email?.trim(),
              row.subject || 'Персонална картичка 🎉',
              blob
            );
            statusDiv.textContent =
              `✅ Изпратени: ${idx+1}/${res.data.length}`;
          } catch (err){
            statusDiv.textContent =
              `❌ Грешка при ред ${idx+1}: ${err.message}`;
          }
    
          await sleep(300);                       // pause 
        } // loop
    
        preview.style.visibility = 'visible';
        alert('🎉 Готово – всички картички са изпратени!');
      } // complete
    });    
}); // CSV change


/* ---- Send button (single mail) ---- */
document.getElementById('sendBtn').addEventListener('click', async () => {
  const to = document.getElementById('recipientEmail').value.trim();
  if (!to){
    alert('Моля, въведете e-mail на получателя.');
    return;
  }
  const subject = document.getElementById('subjectInput').value.trim() ||
                  'Персонална картичка';

  // 1. PNG без download
  const { blob, mime } = await captureCard('png', `card-${Date.now()}`, false);
  const data = await blobToBase64(blob);

  // Изпращаме към бекенда
  try {
    const apiURL = 'http://localhost:3000/send-card';   // <-- абсолютен път
    const res = await fetch(apiURL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },    
      body   : JSON.stringify({
        to, subject,
        fileName: `card-${Date.now()}.png`,
        mime,
        data    // Base64 без prefix
      })
    });
    if (!res.ok) throw new Error(await res.text());
    alert('Картичката беше изпратена успешно!');
  } catch (err){
    alert('Грешка при изпращане: ' + err.message);
  }
});

/* -- Save current card as a 1-row CSV   */
document.getElementById('saveCsvBtn').addEventListener('click', () => {
  /* --- gather basic fields --- */
  const row = {
    email    : document.getElementById('recipientEmail').value.trim(),
    subject  : document.getElementById('subjectInput').value.trim(),
    message  : msgInput.value,
    font     : fontSelect.value,
    fontSize : fontSize.value,
    bgColor  : bgColor.value,
    cardW    : preview.offsetWidth,
    cardH    : preview.offsetHeight,
    image    : imgSelect.value,
    imgSize  : document.getElementById('imgSize').value,
    pos      : txt.style.top || '50%'
  };

  /* --- gather stickers --- */
  const cardBox = preview.getBoundingClientRect();
  const stickers = [...document.querySelectorAll('.sticker-el')].map(stk=>{
    const r   = stk.getBoundingClientRect();          // includes any transform
    const src = stk.src.split('/').pop();             // just the file name
    const x   = Math.round(r.left - cardBox.left);    // px inside card
    const y   = Math.round(r.top  - cardBox.top);
    const w   = Math.round(r.width);
    return `${src}@${x},${y},${w}`;
  }).join(';');
  row.stickers = stickers;


  /* --- build CSV text -- */
  const headers = Object.keys(row).join(',');
  const values  = Object.values(row).map(v => `"${v}"`).join(',');
  const csv     = headers + '\n' + values + '\n';

  /* --- download --- */
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  triggerDownload(url, 'card-preset.csv');
});


})(); // end