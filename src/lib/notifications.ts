import { Resend } from 'resend';
import webpush from 'web-push';

const resend = new Resend(process.env.RESEND_API_KEY);

// Set VAPID details only if keys are provided and valid
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_PUBLIC_KEY !== 'your_vapid_public_key_here' &&
    process.env.VAPID_PRIVATE_KEY !== 'your_vapid_private_key_here') {
  try {
    webpush.setVapidDetails(
      'mailto:alerts@grandarenawindmonitor.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.warn('Invalid VAPID keys, web push notifications disabled');
  }
}

export interface NotificationResult {
  success: boolean;
  id?: string;
  error?: any;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<NotificationResult> {
  try {
    const data = await resend.emails.send({
      from: 'Grand Arena Wind Monitor <noreply@grandarenawindmonitor.com>',
      to,
      subject,
      html,
    });
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendSMS(to: string, text: string): Promise<NotificationResult> {
  // SMS not supported by Resend API
  console.warn('SMS functionality not implemented');
  return { success: false, error: 'SMS not supported' };
}

export async function sendWebPush(subscription: webpush.PushSubscription, payload: string): Promise<NotificationResult> {
  try {
    const result = await webpush.sendNotification(subscription, payload);
    return { success: true, id: result.statusCode.toString() };
  } catch (error) {
    console.error('Web push send error:', error);
    return { success: false, error };
  }
}

export function generateEmailTemplate(alertType: string, message: string, windSpeed: number): string {
  const logoUrl = 'https://yourdomain.com/logo.png'; // Replace with actual URL
  return `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
      <meta charset="UTF-8">
      <title>Alertă Vânt - Grand Arena Wind Monitor</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
        <img src="${logoUrl}" alt="Grand Arena Wind Monitor" style="width: 100px; height: auto; display: block; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Alertă de Vânt</h1>
        <p style="color: #666; font-size: 16px;">${message}</p>
        <p style="color: #666; font-size: 16px;">Viteza vântului: ${windSpeed} km/h</p>
        <p style="color: #666; font-size: 14px;">Aceasta este o alertă automată de la Grand Arena Wind Monitor.</p>
        <footer style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
          Dacă nu doriți să primiți aceste alerte, vă rugăm să vă dezabonați din setările aplicației.
        </footer>
      </div>
    </body>
    </html>
  `;
}

export function generateSMSTemplate(message: string, windSpeed: number): string {
  return `Alertă Vânt: ${message}. Viteza: ${windSpeed} km/h. Grand Arena Wind Monitor.`;
}

export function generateWebPushPayload(title: string, body: string, windSpeed: number): string {
  return JSON.stringify({
    title,
    body,
    icon: '/icon.png',
    data: { windSpeed }
  });
}

// GDPR compliance: Assume consent is checked before calling these functions
// Delivery tracking: Use the returned id for tracking