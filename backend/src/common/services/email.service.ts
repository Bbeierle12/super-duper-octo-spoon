import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, html, text } = options;

    // In development, just log the email
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`📧 Email (DEV MODE):`);
      this.logger.log(`   To: ${to}`);
      this.logger.log(`   Subject: ${subject}`);
      this.logger.log(`   Text: ${text || 'N/A'}`);
      this.logger.log(`   HTML: ${html.substring(0, 100)}...`);
      return;
    }

    // In production, integrate with SendGrid/SES/SMTP
    // Example with nodemailer:
    /*
    const transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });

    await transporter.sendMail({
      from: this.configService.get('FROM_EMAIL'),
      to,
      subject,
      text,
      html,
    });
    */

    this.logger.log(`Email sent to ${to}: ${subject}`);
  }

  async sendInvitation(
    email: string,
    inviterName: string,
    tenantName: string,
    inviteToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const inviteUrl = `${frontendUrl}/invitations/${inviteToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 DreamBuildDrive</h1>
            </div>
            <div class="content">
              <h2>You've been invited!</h2>
              <p><strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong> on DreamBuildDrive.</p>
              <p>DreamBuildDrive is a project planning platform for automotive builds and restorations.</p>
              <a href="${inviteUrl}" class="button">Accept Invitation</a>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Or copy this link: <br/>
                <code>${inviteUrl}</code>
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This invitation expires in 7 days.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DreamBuildDrive. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      You've been invited!

      ${inviterName} has invited you to join ${tenantName} on DreamBuildDrive.

      Accept your invitation by visiting: ${inviteUrl}

      This invitation expires in 7 days.
    `;

    await this.sendEmail({
      to: email,
      subject: `Invitation to join ${tenantName} on DreamBuildDrive`,
      html,
      text,
    });
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 DreamBuildDrive</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Or copy this link: <br/>
                <code>${resetUrl}</code>
              </p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link expires in 30 minutes and can only be used once.
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                If you didn't request this reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DreamBuildDrive. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Password Reset Request

      We received a request to reset your password.

      Reset your password by visiting: ${resetUrl}

      This link expires in 30 minutes and can only be used once.

      If you didn't request this reset, you can safely ignore this email.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset your DreamBuildDrive password',
      html,
      text,
    });
  }

  async sendWelcome(email: string, name: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .features { list-style: none; padding: 0; }
            .features li { padding: 10px 0; border-bottom: 1px solid #ddd; }
            .features li:before { content: "✓ "; color: #1976d2; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Welcome to DreamBuildDrive!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Welcome to DreamBuildDrive! We're excited to help you plan, budget, and document your automotive builds.</p>

              <h3>Get Started:</h3>
              <ul class="features">
                <li>Create your first project</li>
                <li>Add parts and track costs</li>
                <li>Upload photos and documents</li>
                <li>Manage tasks and milestones</li>
                <li>Invite team members (Pro plan)</li>
              </ul>

              <a href="${frontendUrl}/dashboard" class="button">Go to Dashboard</a>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Need help? Check out our <a href="${frontendUrl}/docs">documentation</a> or contact support.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DreamBuildDrive. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to DreamBuildDrive!

      Hi ${name},

      We're excited to help you plan, budget, and document your automotive builds.

      Get Started:
      - Create your first project
      - Add parts and track costs
      - Upload photos and documents
      - Manage tasks and milestones
      - Invite team members (Pro plan)

      Visit your dashboard: ${frontendUrl}/dashboard
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to DreamBuildDrive! 🚗',
      html,
      text,
    });
  }
}
