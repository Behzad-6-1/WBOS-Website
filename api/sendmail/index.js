const nodemailer = require('nodemailer');

module.exports = async function (context, req) {

    context.res = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    if (req.method === 'OPTIONS') {
        context.res.status = 204;
        context.res.body = '';
        return;
    }

    if (req.method === 'GET') {
        context.res.status = 200;
        context.res.body = JSON.stringify({ status: 'ok' });
        return;
    }

    const body = req.body || {};
    const { type, company, name, phone, email, state, enquiry, message } = body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // --- Newsletter subscription ---
    if (type === 'newsletter') {
        if (!email) {
            context.res.status = 400;
            context.res.body = JSON.stringify({ error: 'Email address is required.' });
            return;
        }

        const internalMail = {
            from: `"WBOS Website" <${process.env.SMTP_USER}>`,
            to: 'sales@logixis.com.au',
            subject: 'WBOS Newsletter – New Subscription Request',
            html: `
                <h2>New Newsletter Subscription Request</h2>
                <p>A visitor has signed up to receive WBOS updates:</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p style="margin-top:20px; font-size:12px; color:#888;">
                    Sent from the WBOS website at <a href="https://www.logixis.com.au">www.logixis.com.au</a>
                </p>
            `
        };

        const confirmationMail = {
            from: `"WBOS by LogixIS" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Thanks for subscribing to WBOS updates',
            html: `
                <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
                    <h2 style="color:#2c3e50;">Thank you for subscribing!</h2>
                    <p>You're now signed up to receive updates from WBOS&trade; by Logixis.</p>
                    <p>We'll keep you informed as we roll out new modules, compliance features and platform upgrades.</p>
                    <p style="margin-top:24px;">If you have any questions in the meantime, feel free to <a href="https://www.logixis.com.au/ContactUs.html">contact us</a>.</p>
                    <p style="margin-top:32px; font-size:12px; color:#888;">
                        &copy; 2025 Logixis. All rights reserved.<br>
                        <a href="https://www.logixis.com.au">www.logixis.com.au</a>
                    </p>
                </div>
            `
        };

        try {
            await transporter.sendMail(internalMail);
        } catch (error) {
            context.log.error('Newsletter internal mail error:', error);
        }

        try {
            await transporter.sendMail(confirmationMail);
        } catch (error) {
            context.log.error('Newsletter confirmation mail error:', error);
            context.res.status = 500;
            context.res.body = JSON.stringify({ error: 'Failed to send confirmation email.', detail: error.message });
            return;
        }

        context.res.status = 200;
        context.res.body = JSON.stringify({ success: true });
        return;
    }

    // --- Contact form enquiry ---
    if (!name || !email || !message) {
        context.res.status = 400;
        context.res.body = JSON.stringify({ error: 'Name, email and message are required.' });
        return;
    }

    const internalMail = {
        from: `"WBOS Website" <${process.env.SMTP_USER}>`,
        to: 'sales@logixis.com.au',
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

    const confirmationMail = {
        from: `"WBOS by LogixIS" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Thank you for your enquiry – WBOS by LogixIS`,
        html: `
            <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
                <h2 style="color:#2c3e50;">Thank you for your enquiry, ${name}!</h2>
                <p>We have received your message and will get back to you shortly.</p>
                <table style="border-collapse:collapse; width:100%; font-size:14px; margin-top:20px;">
                    <tr style="background:#2c3e50; color:#fff;">
                        <th style="padding:10px 14px; text-align:left;">Enquiry Type</th>
                        <th style="padding:10px 14px; text-align:left;">Your Message</th>
                    </tr>
                    <tr style="background:#f7f9fb;">
                        <td style="padding:10px 14px; vertical-align:top; white-space:nowrap;">${enquiry || 'General Enquiry'}</td>
                        <td style="padding:10px 14px;">${message.replace(/\n/g, '<br>')}</td>
                    </tr>
                </table>
                <p style="margin-top:24px;">A member of the Logixis team will be in touch with you shortly.</p>
                <p style="margin-top:32px; font-size:12px; color:#888;">
                    &copy; 2025 Logixis. All rights reserved.<br>
                    <a href="https://www.logixis.com.au">www.logixis.com.au</a>
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(internalMail);
        await transporter.sendMail(confirmationMail);
        context.res.status = 200;
        context.res.body = JSON.stringify({ success: true });
    } catch (error) {
        context.log.error('Email send error:', error);
        context.res.status = 500;
        context.res.body = JSON.stringify({
            error: 'Failed to send email.',
            detail: error.message,
            code: error.code
        });
    }
};
