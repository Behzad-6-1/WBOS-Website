const nodemailer = require('nodemailer');

module.exports = async function (context, req) {
    // Allow requests from your website
    context.res = {
        headers: {
            'Access-Control-Allow-Origin': 'https://www.logixis.com.au',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res.status = 204;
        return;
    }

    // Get form data from request body
    const { company, name, phone, email, state, enquiry, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        context.res.status = 400;
        context.res.body = { error: 'Name, email and message are required.' };
        return;
    }

    // Set up Microsoft 365 SMTP transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.SMTP_USER,     // shane@logixis.com.au (set in Azure config)
            pass: process.env.SMTP_PASSWORD  // Shane's password (set in Azure config)
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    // Build the email
    const mailOptions = {
        from: `"WBOS Website" <${process.env.SMTP_USER}>`,
        to: 'behzad0601@gmail.com',
        replyTo: email,
        subject: `WBOS Contact Form – ${enquiry || 'General Enquiry'} from ${company || name}`,
        html: `
            <h2>New Contact Form Submission</h2>
            <table style="border-collapse:collapse; width:100%; font-family:Arial,sans-serif; font-size:14px;">
                <tr style="background:#2c3e50; color:#fff;">
                    <th style="padding:10px 14px; text-align:left;">Field</th>
                    <th style="padding:10px 14px; text-align:left;">Value</th>
                </tr>
                <tr style="background:#f7f9fb;">
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;"><strong>Company</strong></td>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;">${company || '—'}</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;"><strong>Name</strong></td>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;">${name}</td>
                </tr>
                <tr style="background:#f7f9fb;">
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;"><strong>Phone</strong></td>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;">${phone || '—'}</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;"><strong>Email</strong></td>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr style="background:#f7f9fb;">
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;"><strong>State</strong></td>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;">${state || '—'}</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;"><strong>Enquiry Type</strong></td>
                    <td style="padding:10px 14px; border-bottom:1px solid #e8ecf0;">${enquiry || '—'}</td>
                </tr>
                <tr style="background:#f7f9fb;">
                    <td style="padding:10px 14px;"><strong>Message</strong></td>
                    <td style="padding:10px 14px;">${message.replace(/\n/g, '<br>')}</td>
                </tr>
            </table>
            <p style="margin-top:20px; font-size:12px; color:#888;">
                Sent from the WBOS contact form at <a href="https://www.logixis.com.au">www.logixis.com.au</a>
            </p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        context.res.status = 200;
        context.res.body = { success: true };
    } catch (error) {
        context.log.error('Email send error:', error);
        context.res.status = 500;
        context.res.body = { error: 'Failed to send email. Please try again.' };
    }
};
