require('dotenv').config();
const emailService = require('../services/email.service');

async function runTest() {
    console.log('='.repeat(60));
    console.log(' Finova Email Service Live Verification');
    console.log('='.repeat(60));
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '(not configured)');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****** (Configured)' : '(not configured)');
    console.log('-'.repeat(60));

    console.log('Attempting to send a test Registration welcome email...');
    const targetEmail = process.argv[2] || process.env.EMAIL_USER || 'customer@example.com';
    
    const result = await emailService.sendRegistrationEmail(targetEmail, 'Ranjit Gupta');

    if (result) {
        console.log('✅ Email service is fully functional!');
        console.log('Test recipient:', targetEmail);
    } else {
        console.error('❌ Email sending failed.');
    }
    console.log('='.repeat(60));
}

runTest();
