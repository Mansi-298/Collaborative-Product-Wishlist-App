const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendInvitation = async (to, wishlistName, inviterName, inviteLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `You've been invited to collaborate on a wishlist!`,
    html: `
      <h2>Wishlist Invitation</h2>
      <p>Hi there!</p>
      <p>${inviterName} has invited you to collaborate on the wishlist "${wishlistName}".</p>
      <p>Click the link below to join:</p>
      <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Join Wishlist</a>
      <p>If you don't have an account yet, you'll be able to create one when you click the link.</p>
      <p>Happy collaborating!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendInvitation
}; 