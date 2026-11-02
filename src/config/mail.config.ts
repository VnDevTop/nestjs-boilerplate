import { registerAs } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';

/**
 * Mailer configuration namespace using Nodemailer.
 *
 * SMTP connection settings are read from environment variables:
 * - MAIL_HOST: SMTP host URL (optional, defaults to 'smtp.google.com').
 * - MAIL_PORT: SMTP port (required)
 * - MAIL_USERNAME: SMTP username (required)
 * - MAIL_PASSWORD: SMTP password (required)
 * - MAIL_FROM: Default sender email address (optional)
 * - MAIL_TLS: Enable TLS (optional, default: true)
 * - MAIL_SECURE: Use SSL (optional, default: true for port 465)
 */
export const mailConfig = registerAs<MailerOptions>(
  'mail',
  () => ({
    // Use nodemailer transport
    transport: {
      host: process.env.MAIL_HOST ?? 'smtp.google.com',
      port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      secure: process.env.MAIL_SECURE !== 'false',
    },
    // Default from address
    from: process.env.MAIL_FROM ?? 'no-reply@example.com',
    // Send mail via preview URL (for development)
    preview: process.env.MAIL_PREVIEW === 'true',
  })
);