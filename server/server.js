import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';  

const app = express();
app.use(cors());                       
app.use(express.json({ limit: '15mb' }));


/* ---------- SMTP транспорт ---------- */
const transporter = nodemailer.createTransport({
  host  : 'smtp.gmail.com',   
  port  : 465,
  secure: true,               
  auth  : {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/* ----------send-card ---------- */
app.post('/send-card', async (req, res) => {
  const { to, subject, fileName, mime, data } = req.body;

  if (!to || !fileName || !data){
    return res.status(400).send('Missing fields');
  }

  try {
    await transporter.sendMail({
      from: `"Card Bot" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || 'Персонална картичка 🎉',
      html: '<p>Вижте прикачената картичка 😊</p>',
      attachments: [{
        filename: fileName,
        content : data,
        encoding: 'base64',
        contentType: mime || 'image/png'
      }]
    });
    res.sendStatus(200);
  } catch (err){
    console.error(err);
    res.status(500).send(err.message);
  }
});

/* ---------- стартираме --- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✉️  Mail server listening on :${PORT}`));
