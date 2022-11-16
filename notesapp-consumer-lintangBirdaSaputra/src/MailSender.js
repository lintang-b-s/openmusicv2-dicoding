import nodemailer from 'nodemailer';
// port bisa 465
// host: smtp.gmai.com
class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 465,
      secure: false,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1'
      },
    });
  }

  sendEmail(targetEmail, content) {
    const message = {
      from: 'Openmusic App Dicoding',
      to: targetEmail,
      subject: 'Ekspor lagu indah',
      text: 'Terlampir hasil dari ekspor catatan',
      attachments: [
        {
          filename: 'songs.json',
          content,
        },
      ],
    };

    return this._transporter.sendMail(message);
  }
}

export default MailSender;
