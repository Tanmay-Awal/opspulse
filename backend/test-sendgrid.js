const { MailService } = require('@sendgrid/mail');

const mailService = new MailService();
mailService.setApiKey('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');

const msg = {
    to: 'sgs.tanmay.9feb.9@gmail.com',
    from: 'awaltanmay@gmail.com', // Must be your verified email
    subject: 'Test from OpsPulse',
    text: 'If you see this, SendGrid works!',
    html: '<strong>SendGrid is working!</strong>',
};

mailService.send(msg)
    .then(() => {
        console.log('✅ Email sent successfully');
    })
    .catch(error => {
        console.error('❌ Error:', error.response ? error.response.body : error.message);
    });