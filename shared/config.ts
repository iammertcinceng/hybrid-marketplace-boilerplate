interface Config {
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromAddress: string;
  };
  appUrl: string;
}

export const config: Config = {
  email: {
    //sendgrid
    // host: 'smtp.sendgrid.net',
    // port: 587,
    // secure: false,
    // user: 'apikey', // SendGrid requires this to be 'apikey'
    // password: process.env.SENDGRID_API_KEY || '',
    // fromName: 'İlan Yönetim Sistemi',
    // fromAddress: process.env.SENDGRID_FROM_EMAIL || 'mertcin0@outlook.com',
    
    //smtp2go -smtp altyapısı için.
    host: process.env.SMTP_HOST || 'mail.smtp2go.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'false',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'İlan Yönetim Sistemi',
    fromAddress: process.env.SMTP_FROM_EMAIL || 'mertcin0@outlook.com',
  },
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};