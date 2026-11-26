import nodemailer from 'nodemailer'

/**
 * Configure Nodemailer Transporter
 * Supports Gmail SMTP or any custom SMTP provider via environment variables.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT) || 587
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim()
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '')

  if (user && pass) {
    if (host.includes('gmail.com') || (typeof user === 'string' && user.includes('@gmail.com'))) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      })
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })
  }

  return null
}

const getFromAddress = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER
  if (user) {
    return `"Kerala Kalyans Matrimony" <${user}>`
  }
  return process.env.EMAIL_FROM || '"Kerala Kalyans Matrimony" <no-reply@keralakalyans.com>'
}

const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:5173'
}

/**
 * Common HTML email wrapper with luxury responsive styling
 */
const emailWrapper = ({ title, preheader, contentHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D2424; line-height: 1.6; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 18px; border: 1px solid #eadfce; overflow: hidden; box-shadow: 0 10px 30px rgba(112, 28, 53, 0.08); }
    .header { background: linear-gradient(135deg, #701C35 0%, #4D0E20 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; letter-spacing: 1.5px; }
    .header p { margin: 8px 0 0; color: #E8CA91; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; }
    .body { padding: 36px 32px; font-size: 15px; }
    .greeting { font-size: 18px; font-weight: 700; color: #701C35; margin-bottom: 16px; }
    .card-box { background: #FAF7F1; border: 1px solid #eadfce; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .card-box h3 { margin: 0 0 12px; color: #701C35; font-size: 15px; font-weight: 700; border-bottom: 1px solid #eadfce; padding-bottom: 8px; }
    .credential-row { margin: 8px 0; font-size: 14px; }
    .credential-label { color: #776258; font-weight: 600; }
    .credential-value { font-family: 'Courier New', Courier, monospace; background: #ffffff; padding: 4px 10px; border-radius: 6px; border: 1px solid #eadfce; font-weight: 700; color: #701C35; display: inline-block; }
    .btn-container { text-align: center; margin: 32px 0 20px; }
    .btn { display: inline-block; background-color: #701C35; color: #ffffff !important; text-decoration: none; padding: 14px 38px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 6px 18px rgba(112, 28, 53, 0.25); }
    .alert-warning { background: #FFF8E7; border-left: 4px solid #C8A96B; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 13px; color: #6C5200; }
    .footer { background: #F8F5EE; padding: 24px 30px; text-align: center; font-size: 12px; color: #8C7E74; border-top: 1px solid #eadfce; }
    .badge-pending { display: inline-block; padding: 6px 14px; border-radius: 20px; background: #FFF3E0; color: #E65100; font-weight: 700; font-size: 12px; margin-bottom: 16px; }
    .badge-approved { display: inline-block; padding: 6px 14px; border-radius: 20px; background: #E8F5E9; color: #2E7D32; font-weight: 700; font-size: 12px; margin-bottom: 16px; }
    .badge-rejected { display: inline-block; padding: 6px 14px; border-radius: 20px; background: #FFEBEE; color: #C62828; font-weight: 700; font-size: 12px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Kerala Kalyans</h1>
      <p>MATRIMONY · WHERE BEAUTIFUL STORIES BEGIN</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;">© ${new Date().getFullYear()} Kerala Kalyans Matrimony. All rights reserved.</p>
      <p style="margin: 0; font-size: 11px;">Exquisite Kerala Matchmaking with Dignity, Privacy & Trust.</p>
    </div>
  </div>
</body>
</html>
`

/**
 * 1. Send Welcome Email upon registration
 * Subject: Registration Successful – Welcome!
 */
export const sendWelcomeEmail = async (user) => {
  const to = user.email
  const name = user.name || 'Member'
  const subject = 'Registration Successful – Welcome!'

  const contentHtml = `
    <div class="greeting">Dear ${name},</div>
    <div class="badge-pending">⏳ REGISTRATION PENDING ADMIN APPROVAL</div>
    <p>Thank you for choosing <b>Kerala Kalyans Matrimony</b>. Your registration has been submitted successfully and received by our admissions team.</p>
    
    <div class="card-box">
      <h3>Registration Confirmation</h3>
      <div class="credential-row"><span class="credential-label">Full Name:</span> <b>${name}</b></div>
      <div class="credential-row"><span class="credential-label">Registered Email:</span> <b>${to}</b></div>
      <div class="credential-row"><span class="credential-label">Account Status:</span> <b style="color: #E65100;">Pending Verification</b></div>
    </div>

    <p>To ensure a genuine, high-trust community, all matrimonial accounts undergo manual review and verification by our administrators.</p>

    <div class="alert-warning">
      <b>What happens next?</b><br/>
      Our team is currently reviewing your registration details. As soon as your account is approved, you will receive an email containing your temporary login credentials and direct access link.
    </div>

    <p style="color: #776258; font-size: 13px;">Please note: You will not be able to log in until your account has received administrator approval.</p>
  `

  const textContent = `
Dear ${name},

Welcome to Kerala Kalyans Matrimony!

Your registration has been submitted successfully and is currently awaiting administrator approval.

Account Details:
- Name: ${name}
- Email: ${to}
- Status: Pending Approval

All profiles undergo careful review to maintain platform security and authenticity. Once our administrator approves your account, we will dispatch an email with your login credentials.

Warm regards,
Kerala Kalyans Matrimony Team
  `.trim()

  return dispatchEmail({ to, subject, html: emailWrapper({ title: subject, preheader: 'Your registration is under review', contentHtml }), text: textContent })
}

/**
 * 2. Send Approval Email with temporary password
 * Subject: Kerala Kalyans Matrimony - Account Approval Credentials
 */
export const sendApprovalEmail = async (user, temporaryPassword) => {
  const to = user.email || (typeof user === 'string' ? user : '')
  const name = user.name || 'Valued Member'
  const frontendUrl = getFrontendUrl()
  const loginUrl = `${frontendUrl}/#login?email=${encodeURIComponent(to)}`
  const subject = 'Kerala Kalyans Matrimony - Account Approval Credentials'

  const contentHtml = `
    <div class="greeting">Dear ${name},</div>
    <div class="badge-approved">✓ ACCOUNT APPROVED</div>
    <p>Congratulations! Your matrimonial registration on <b>Kerala Kalyans Matrimony</b> has been verified and approved by our administrator.</p>

    <!-- 10 MINUTE EXPIRATION WARNING BANNER -->
    <div style="background: #FFF3CD; border-left: 5px solid #E65100; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 13.5px; color: #7B341E;">
      <b style="font-size: 14px; color: #B71C1C;">⏱️ TIME-SENSITIVE NOTICE:</b><br/>
      This temporary password is valid for <b>10 MINUTES ONLY</b>. Please log in immediately and set your new permanent password before it expires.
    </div>

    <div class="card-box" style="background: #FAF7F1; border: 1px solid #eadfce; border-radius: 12px; padding: 22px; margin: 24px 0;">
      <h3 style="margin: 0 0 14px; color: #701C35; font-size: 15px; font-weight: 700; border-bottom: 1px solid #eadfce; padding-bottom: 8px;">Your Login Credentials</h3>
      
      <div class="credential-row" style="margin-bottom: 12px;">
        <span class="credential-label" style="color: #776258; font-weight: 600;">Registered Email:</span><br/>
        <b style="color: #2D2424; font-size: 14px;">${to}</b>
      </div>

      <div class="credential-row" style="margin-bottom: 14px;">
        <span class="credential-label" style="color: #776258; font-weight: 600;">Temporary Password:</span><br/>
        <div style="margin-top: 6px; display: inline-block; background: #ffffff; padding: 8px 16px; border-radius: 8px; border: 2px dashed #701C35; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #701C35; letter-spacing: 2px;">
          ${temporaryPassword}
        </div>
        <div style="font-size: 11px; color: #8C7E74; margin-top: 4px;">(Letters, digits &amp; special characters combination)</div>
      </div>

      <div class="credential-row" style="margin-top: 14px; border-top: 1px solid #eadfce; padding-top: 12px;">
        <span class="credential-label" style="color: #776258; font-weight: 600;">Login Page URL:</span><br/>
        <a href="${loginUrl}" target="_blank" style="color: #701C35; font-weight: 600; text-decoration: underline; word-break: break-all; font-size: 13px;">${loginUrl}</a>
      </div>
    </div>

    <div class="btn-container" style="text-align: center; margin: 28px 0 20px;">
      <a href="${loginUrl}" class="btn" target="_blank" style="display: inline-block; background-color: #701C35; color: #ffffff !important; text-decoration: none; padding: 14px 42px; border-radius: 50px; font-weight: 700; font-size: 15px; box-shadow: 0 6px 18px rgba(112, 28, 53, 0.25);">
        👉 Click Here to Log In
      </a>
    </div>

    <div class="alert-warning" style="background: #FFF8E7; border-left: 4px solid #C8A96B; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 13px; color: #6C5200;">
      <b>🔐 Next Step: Mandatory Password Change:</b><br/>
      Upon your first login, the system will prompt you to replace this temporary password with your own secure private password. Access to your dashboard will be unlocked immediately after.
    </div>

    <p style="font-size: 12px; color: #8C7E74; line-height: 1.5; margin-top: 24px;">
      🔒 <b>Security Reminder:</b> Never share your credentials with anyone. Kerala Kalyans representatives will never ask for your password.
    </p>
  `

  const textContent = `
Dear ${name},

Congratulations! Your account on Kerala Kalyans Matrimony has been approved by the administrator.

IMPORTANT: This temporary password is valid for 10 MINUTES ONLY.

Your Login Credentials:
- Login Page URL: ${loginUrl}
- Registered Email: ${to}
- Temporary Password: ${temporaryPassword}

Instructions:
1. Open the Login link: ${loginUrl}
2. Sign in using your registered email and the temporary password above.
3. You will immediately be prompted to change this temporary password to your own permanent password.

Warm regards,
Kerala Kalyans Matrimony Team
  `.trim()

  return dispatchEmail({
    to,
    subject,
    html: emailWrapper({ title: subject, preheader: 'Account Approved! Your temporary login password (valid 10 mins)', contentHtml }),
    text: textContent,
    temporaryPassword
  })
}

/**
 * 3. Send Rejection Email
 * Subject: Account Status Update – Kerala Kalyans Matrimony
 */
export const sendRejectionEmail = async (user) => {
  const to = user.email
  const name = user.name || 'Member'
  const subject = 'Account Status Update – Kerala Kalyans Matrimony'

  const contentHtml = `
    <div class="greeting">Dear ${name},</div>
    <div class="badge-rejected">APPLICATION UPDATE</div>
    <p>Thank you for your interest in joining <b>Kerala Kalyans Matrimony</b>.</p>
    <p>After reviewing the details submitted in your profile application, our administration team is unable to approve your account at this time as it did not fulfill our community guidelines or verification requirements.</p>

    <div class="card-box">
      <div class="credential-row"><span class="credential-label">Registered Email:</span> <b>${to}</b></div>
      <div class="credential-row"><span class="credential-label">Account Status:</span> <b style="color: #C62828;">Application Declined</b></div>
    </div>

    <p>If you believe this decision was made in error or wish to provide updated documentation, please contact our support team at <a href="mailto:support@keralakalyans.com" style="color: #701C35;">support@keralakalyans.com</a>.</p>
  `

  const textContent = `
Dear ${name},

Thank you for your interest in Kerala Kalyans Matrimony.

Following a review of your application, we regret to inform you that your registration could not be approved at this time.

If you have questions, please reach out to support@keralakalyans.com.

Sincerely,
Kerala Kalyans Matrimony Admissions Team
  `.trim()

  return dispatchEmail({ to, subject, html: emailWrapper({ title: subject, preheader: 'Update on your account application', contentHtml }), text: textContent })
}

/**
 * Core dispatch function with error handling and fallback simulation
 */
const dispatchEmail = async ({ to, subject, html, text, temporaryPassword }) => {
  const from = getFromAddress()
  const transporter = getTransporter()

  if (transporter) {
    try {
      const user = process.env.SMTP_USER || process.env.EMAIL_USER
      const info = await transporter.sendMail({
        from,
        to,
        replyTo: user || from,
        subject,
        text,
        html
      })
      console.log(`[EMAIL DISPATCHED] To: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`)
      return { success: true, mode: 'smtp', messageId: info.messageId, recipient: to }
    } catch (err) {
      console.error(`[EMAIL DISPATCH ERROR] Failed sending to ${to}:`, err.message)
      return { success: false, mode: 'smtp', error: err.message, recipient: to }
    }
  }

  // Development mode simulation (when no SMTP credentials configured)
  console.log('============================================================')
  console.log('✉️  [SIMULATED EMAIL DISPATCH - NODEMAILER DEV MODE]')
  console.log(`To: ${to}`)
  console.log(`From: ${from}`)
  console.log(`Subject: ${subject}`)
  console.log('Body Preview:\n', text)
  console.log('============================================================')

  return {
    success: true,
    mode: 'simulated',
    recipient: to,
    subject,
    temporaryPassword
  }
}

export default {
  sendWelcomeEmail,
  sendApprovalEmail,
  sendRejectionEmail
}
