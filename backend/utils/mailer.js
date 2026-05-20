import nodemailer from 'nodemailer';

export const REQUIREMENT_EMAIL = process.env.REQUIREMENT_EMAIL || 'team@example.com';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildRequirementHtml(title, fields) {
  const rows = Object.entries(fields)
    .map(([label, value]) => {
      const display = Array.isArray(value) ? value.join(', ') : value;
      return `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${escapeHtml(display || 'N/A')}</td></tr>`;
    })
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#111827">
      <h2>${escapeHtml(title)}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px">${rows}</table>
    </div>
  `;
}

export async function sendRequirementMail({ subject, html, attachments = [] }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`Email not sent because EMAIL_USER/EMAIL_PASS are not configured. Intended recipient: ${REQUIREMENT_EMAIL}`);
    return { sent: false, reason: 'SMTP credentials not configured' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: REQUIREMENT_EMAIL,
    subject,
    html,
    attachments,
  });

  return { sent: true };
}

export async function sendDirectMail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`Email not sent because EMAIL_USER/EMAIL_PASS are not configured. Intended recipient: ${to}`);
    return { sent: false, reason: 'SMTP credentials not configured' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  return { sent: true };
}
