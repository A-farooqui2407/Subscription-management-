/**
 * Email via nodemailer — password reset, invoices, etc.
 */
const nodemailer = require('nodemailer');

let cachedTransporter;

/**
 * SMTP transporter from environment.
 */
function getTransporter() {
  if (!cachedTransporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return cachedTransporter;
}

/**
 * Send arbitrary HTML/text email.
 */
async function sendMail({ to, subject, text, html, from }) {
  const transporter = getTransporter();
  const mailFrom = from || process.env.SMTP_FROM || process.env.EMAIL_FROM;
  await transporter.sendMail({
    from: mailFrom,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Password reset link email.
 * @param {string} to
 * @param {string} resetLink
 */
async function sendResetPasswordEmail(to, resetLink) {
  const subject = 'Reset your password';
  const text = `You requested a password reset. Open this link (valid 10 minutes):\n\n${resetLink}\n\nIf you did not request this, ignore this email.`;
  const html = `
    <p>You requested a password reset.</p>
    <p><a href="${resetLink}">Reset your password</a></p>
    <p>This link expires in 10 minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `.trim();

  await sendMail({
    to,
    subject,
    text,
    html,
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM,
  });
}

/** @deprecated Use sendResetPasswordEmail */
async function sendPasswordResetEmail({ to, resetLink }) {
  await sendResetPasswordEmail(to, resetLink);
}

/**
 * Welcome email for new internal users (includes temporary password).
 * @param {string} to — recipient email
 * @param {string} name — display name
 * @param {string} temporaryPassword — plain password (for first login; user should change it)
 */
async function sendWelcomeEmail(to, name, temporaryPassword) {
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const loginLink = `${frontendUrl}/login`;
  const subject = 'Welcome to Subscription Management System';
  const text = `Hello ${name},

Welcome to the Subscription Management System.

Your account email: ${to}
Your temporary password: ${temporaryPassword}

Please sign in here: ${loginLink}

We recommend changing your password after your first login.

— Subscription Management System`;
  const html = `
    <p>Hello ${escapeHtml(name)},</p>
    <p>Welcome to the <strong>Subscription Management System</strong>.</p>
    <ul>
      <li><strong>Email:</strong> ${escapeHtml(to)}</li>
      <li><strong>Temporary password:</strong> ${escapeHtml(temporaryPassword)}</li>
    </ul>
    <p><a href="${escapeHtml(loginLink)}">Sign in</a></p>
    <p>We recommend changing your password after your first login.</p>
    <p>— Subscription Management System</p>
  `.trim();

  await sendMail({
    to,
    subject,
    text,
    html,
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM,
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Send invoice notification to customer.
 * @param {string} to
 * @param {import('sequelize').Model|object} invoice
 */
async function sendInvoiceEmail(to, invoice) {
  const plain = typeof invoice.get === 'function' ? invoice.get({ plain: true }) : invoice;
  const num = plain.invoiceNumber || plain.id;
  const total = plain.total != null ? String(plain.total) : '—';
  const due = plain.dueDate != null ? String(plain.dueDate) : '—';
  const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const viewPath = `/invoices/${plain.id}`;
  const viewUrl = base ? `${base}${viewPath}` : viewPath;

  const subject = `Invoice ${num} from Subscription Management`;
  const text = [
    `Invoice number: ${num}`,
    `Total amount: ${total}`,
    `Due date: ${due}`,
    '',
    `View your invoice: ${viewUrl}`,
  ].join('\n');

  const html = `
    <p>Your invoice <strong>${escapeHtml(String(num))}</strong> is ready.</p>
    <ul>
      <li><strong>Total amount:</strong> ${escapeHtml(total)}</li>
      <li><strong>Due date:</strong> ${escapeHtml(due)}</li>
    </ul>
    <p><a href="${escapeHtml(viewUrl)}">View invoice</a></p>
    <p>— Subscription Management</p>
  `.trim();

  await sendMail({
    to,
    subject,
    text,
    html,
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM,
  });
}

module.exports = {
  getTransporter,
  sendMail,
  sendResetPasswordEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendInvoiceEmail,
};
