module.exports = async function (context, req) {
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            status: 'function is working',
            method: req.method,
            smtp_user: process.env.SMTP_USER ? 'SET: ' + process.env.SMTP_USER : 'NOT SET',
            smtp_pass: process.env.SMTP_PASSWORD ? 'SET (hidden)' : 'NOT SET'
        })
    };
};
