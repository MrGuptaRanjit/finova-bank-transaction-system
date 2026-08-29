const nodemailer = require('nodemailer');

let activeTransporter = null;
let transporterInitPromise = null;
let isEthereal = false;

/**
 * Creates or retrieves the email transporter.
 * Strategy:
 * 1. Gmail App Password (EMAIL_USER + EMAIL_PASS) -> Real Gmail SMTP
 * 2. Google OAuth 2.0 (EMAIL_USER + CLIENT_ID + CLIENT_SECRET + REFRESH_TOKEN)
 * 3. Custom SMTP (SMTP_HOST + SMTP_USER + SMTP_PASS)
 * 4. Fallback: Auto-provisioned Ethereal test account for development (generates clickable browser preview URLs)
 */
async function getTransporter() {
  if (activeTransporter) {
    return activeTransporter;
  }
  if (transporterInitPromise) {
    return transporterInitPromise;
  }

  transporterInitPromise = (async () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const refreshToken = process.env.REFRESH_TOKEN;
    const smtpHost = process.env.SMTP_HOST;

  // 1. Gmail App Password (Preferred)
  if (emailUser && emailPass) {
    activeTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    isEthereal = false;
    return activeTransporter;
  }

  // 2. Custom SMTP
  if (smtpHost) {
    activeTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER || emailUser,
        pass: process.env.SMTP_PASS || emailPass,
      },
    });
    isEthereal = false;
    return activeTransporter;
  }

  // 3. Google OAuth2 (Try verify; if token expired, gracefully fallback to test account)
  if (emailUser && clientId && clientSecret && refreshToken) {
    try {
      const oauthTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailUser,
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken,
        },
      });

      await oauthTransporter.verify();
      activeTransporter = oauthTransporter;
      isEthereal = false;
      return activeTransporter;
    } catch (err) {
      console.warn('\n⚠️ [Email Service] Google OAuth2 token is expired/invalid (' + err.message + ').');
      console.warn('👉 Switching to Development Test Mailer (Ethereal). Add EMAIL_PASS to .env for real Gmail.\n');
    }
  }

    try {
      const testAccount = await nodemailer.createTestAccount();
      activeTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
      console.log('📬 [Email Service] Development mailer initialized with Ethereal inbox (' + testAccount.user + ').');
      return activeTransporter;
    } catch (testErr) {
      console.error('❌ [Email Service] Could not initialize test mailer:', testErr.message);
      return null;
    }
  })();

  return await transporterInitPromise;
}

// Verify connection
async function verifyEmailService() {
  const transporter = await getTransporter();
  if (!transporter) {
    console.warn('⚠️ [Email Service] No email transporter available.');
    return false;
  }

  try {
    await transporter.verify();
    if (isEthereal) {
      console.log('✅ [Email Service] Ready (Development Test Mode — Click preview links in console to view emails).');
    } else {
      console.log('✅ [Email Service] Connected to live mail server (' + (process.env.EMAIL_USER || 'SMTP') + ').');
    }
    return true;
  } catch (error) {
    console.error('❌ [Email Service] Verification error:', error.message);
    return false;
  }
}

// Initial verification attempt (non-blocking)
if (process.env.NODE_ENV !== 'test') {
  verifyEmailService().catch(() => {});
}

/**
 * Base function to send an email
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log(`[Email Service - Simulated] To: ${to} | Subject: "${subject}"`);
      return { simulated: true, to, subject };
    }

    const senderName = process.env.EMAIL_FROM_NAME || 'Finova Ledger';
    const senderAddress = isEthereal
      ? 'no-reply@finova.internal'
      : (process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@finova.internal');

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderAddress}>`,
      to,
      subject,
      text,
      html,
    });

    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n📨 [Email Sent to ${to}] Subject: "${subject}"`);
      console.log(`🔗 Preview Email in Browser: ${previewUrl}\n`);
    } else {
      console.log(`[Email Service] Live email sent to ${to}. MessageId: ${info.messageId}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Service] Error sending email to ${to}:`, error.message);
    return null;
  }
};

/**
 * Registration Welcome Email
 */
async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Finova Banking Ledger 🚀';
  const text = `Hello ${name},\n\nThank you for opening an account with Finova Banking Ledger!\n\nYour digital wallet and ledger are ready for secure, real-time fund transfers.\n\nBest regards,\nFinova Team`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
      .container { max-width: 580px; margin: 30px auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%); padding: 36px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
      .content { padding: 32px 30px; }
      .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 16px; }
      .message { font-size: 15px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
      .highlight-card { background: #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 16px; margin: 20px 0; }
      .highlight-card p { margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.5; }
      .footer { padding: 20px 30px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>FINOVA LEDGER</h1>
      </div>
      <div class="content">
        <div class="greeting">Welcome aboard, ${name}! 👋</div>
        <p class="message">Your Finova banking account has been successfully created. You can now execute fast, ACID-compliant transactions, track live transaction ledgers, and manage your assets with bank-grade security.</p>
        
        <div class="highlight-card">
          <p><strong>🔒 Security Note:</strong> Never share your account credentials or session tokens with anyone. Finova support will never ask for your password.</p>
        </div>

        <p class="message">Thank you for choosing Finova. If you have questions, our system is here 24/7 to assist you.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Finova Banking Ledger System. All rights reserved.</p>
        <p>This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

/**
 * Transaction Transfer Notification Email
 */
async function sendTransactionEmail(userEmail, name, amount, toAccount, details = {}) {
  const formattedAmount = Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const subject = `Transfer Successful: ₹${formattedAmount} 💸`;
  const timestamp = details.timestamp ? new Date(details.timestamp).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  const text = `
Hello ${name},

Your transfer of ₹${formattedAmount} has been processed successfully.

Recipient Account: ${toAccount}
Date & Time: ${timestamp}
Status: SUCCESS

Thank you for choosing Finova Ledger.
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
      .container { max-width: 580px; margin: 30px auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
      .content { padding: 32px 30px; }
      .amount-badge { background: #064e3b; border: 1px solid #059669; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
      .amount-badge .label { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6ee7b7; margin-bottom: 6px; }
      .amount-badge .val { font-size: 32px; font-weight: 800; color: #ffffff; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .details-table td { padding: 12px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
      .details-table .key { color: #94a3b8; }
      .details-table .value { color: #f8fafc; text-align: right; font-weight: 600; }
      .badge-success { background: #064e3b; color: #34d399; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
      .footer { padding: 20px 30px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Transfer Completed ✅</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; margin-top: 0; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #94a3b8;">Your fund transfer has been processed and recorded on the ledger.</p>
        
        <div class="amount-badge">
          <div class="label">Amount Debited</div>
          <div class="val">₹${formattedAmount}</div>
        </div>

        <table class="details-table">
          <tr>
            <td class="key">Recipient Account</td>
            <td class="value">${toAccount}</td>
          </tr>
          <tr>
            <td class="key">Date & Time</td>
            <td class="value">${timestamp}</td>
          </tr>
          <tr>
            <td class="key">Status</td>
            <td class="value"><span class="badge-success">COMPLETED</span></td>
          </tr>
        </table>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Finova Banking Ledger System. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

/**
 * Deposit Confirmation Email
 */
async function sendDepositEmail(userEmail, name, amount, accountId) {
  const formattedAmount = Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const subject = `Deposit Successful: ₹${formattedAmount} 📥`;
  const timestamp = new Date().toLocaleString('en-IN');

  const text = `
Hello ${name},

Your deposit of ₹${formattedAmount} has been credited to account ${accountId}.

Date & Time: ${timestamp}
Status: COMPLETED

Thank you for choosing Finova Ledger.
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
      .container { max-width: 580px; margin: 30px auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .header { background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); padding: 32px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
      .content { padding: 32px 30px; }
      .amount-badge { background: #083344; border: 1px solid #0891b2; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
      .amount-badge .label { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #67e8f9; margin-bottom: 6px; }
      .amount-badge .val { font-size: 32px; font-weight: 800; color: #ffffff; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .details-table td { padding: 12px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
      .details-table .key { color: #94a3b8; }
      .details-table .value { color: #f8fafc; text-align: right; font-weight: 600; }
      .badge-success { background: #064e3b; color: #34d399; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
      .footer { padding: 20px 30px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Deposit Credited 📥</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; margin-top: 0; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #94a3b8;">Your deposit has been successfully credited to your account.</p>
        
        <div class="amount-badge">
          <div class="label">Amount Credited</div>
          <div class="val">+₹${formattedAmount}</div>
        </div>

        <table class="details-table">
          <tr>
            <td class="key">Target Account</td>
            <td class="value">${accountId}</td>
          </tr>
          <tr>
            <td class="key">Date & Time</td>
            <td class="value">${timestamp}</td>
          </tr>
          <tr>
            <td class="key">Status</td>
            <td class="value"><span class="badge-success">CREDITED</span></td>
          </tr>
        </table>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Finova Banking Ledger System. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

/**
 * Transaction Failure Notification Email
 */
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount, reason = 'Transaction declined or server issue') {
  const formattedAmount = Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const subject = "Transaction Failed ❌";

  const text = `
Hello ${name},

Unfortunately, your transaction of ₹${formattedAmount} to account ${toAccount} could not be completed.

Reason: ${reason}
Status: FAILED

Please verify your balance or try again later.
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
      .container { max-width: 580px; margin: 30px auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 32px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
      .content { padding: 32px 30px; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .details-table td { padding: 12px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
      .details-table .key { color: #94a3b8; }
      .details-table .value { color: #f8fafc; text-align: right; font-weight: 600; }
      .badge-failed { background: #450a0a; color: #f87171; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
      .footer { padding: 20px 30px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Transaction Failed ❌</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; margin-top: 0; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #94a3b8;">We could not complete your transaction.</p>

        <table class="details-table">
          <tr>
            <td class="key">Attempted Amount</td>
            <td class="value">₹${formattedAmount}</td>
          </tr>
          <tr>
            <td class="key">Target Account</td>
            <td class="value">${toAccount}</td>
          </tr>
          <tr>
            <td class="key">Reason</td>
            <td class="value" style="color: #f87171;">${reason}</td>
          </tr>
          <tr>
            <td class="key">Status</td>
            <td class="value"><span class="badge-failed">FAILED</span></td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #94a3b8;">Please verify that you have sufficient funds and the recipient account ID is valid before retrying.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Finova Banking Ledger System. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

/**
 * Payment Received (Credit) Notification Email
 */
async function sendPaymentReceivedEmail(userEmail, name, amount, fromSenderName, toAccount) {
  const formattedAmount = Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const subject = `Payment Received: ₹${formattedAmount} 💰`;
  const timestamp = new Date().toLocaleString('en-IN');

  const text = `
Hello ${name},

You have received ₹${formattedAmount} from ${fromSenderName || 'a Finova user'}.

Account Credited: ${toAccount}
Date & Time: ${timestamp}
Status: COMPLETED

Thank you for choosing Finova Ledger.
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
      .container { max-width: 580px; margin: 30px auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
      .content { padding: 32px 30px; }
      .amount-badge { background: #064e3b; border: 1px solid #059669; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
      .amount-badge .label { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6ee7b7; margin-bottom: 6px; }
      .amount-badge .val { font-size: 32px; font-weight: 800; color: #ffffff; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .details-table td { padding: 12px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
      .details-table .key { color: #94a3b8; }
      .details-table .value { color: #f8fafc; text-align: right; font-weight: 600; }
      .badge-success { background: #064e3b; color: #34d399; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
      .footer { padding: 20px 30px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Payment Received 💰</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; margin-top: 0; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #94a3b8;">Funds have been credited to your Finova account.</p>
        
        <div class="amount-badge">
          <div class="label">Amount Received</div>
          <div class="val">+₹${formattedAmount}</div>
        </div>

        <table class="details-table">
          <tr>
            <td class="key">Sender</td>
            <td class="value">${fromSenderName || 'Finova Transfer'}</td>
          </tr>
          <tr>
            <td class="key">Target Account</td>
            <td class="value">${toAccount}</td>
          </tr>
          <tr>
            <td class="key">Date & Time</td>
            <td class="value">${timestamp}</td>
          </tr>
          <tr>
            <td class="key">Status</td>
            <td class="value"><span class="badge-success">CREDITED</span></td>
          </tr>
        </table>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Finova Banking Ledger System. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  getTransporter,
  verifyEmailService,
  sendEmail,
  sendRegistrationEmail,
  sendTransactionEmail,
  sendDepositEmail,
  sendPaymentReceivedEmail,
  sendTransactionFailureEmail,
};