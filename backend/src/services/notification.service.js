const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send email notification
  async sendEmail(to, subject, html, text = '') {
    try {
      const info = await this.transporter.sendMail({
        from: `"AI Resume Matcher" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      });

      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Interview scheduled notification
  async sendInterviewScheduledEmail(candidateEmail, recruiterEmail, interviewDetails) {
    const candidateHtml = `
      <h2>Interview Scheduled!</h2>
      <p>Your interview has been scheduled with the following details:</p>
      <ul>
        <li><strong>Position:</strong> ${interviewDetails.jobTitle}</li>
        <li><strong>Company:</strong> ${interviewDetails.company}</li>
        <li><strong>Date & Time:</strong> ${new Date(interviewDetails.dateTime).toLocaleString()}</li>
        <li><strong>Duration:</strong> ${interviewDetails.duration} minutes</li>
        <li><strong>Type:</strong> ${interviewDetails.type}</li>
        ${interviewDetails.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></li>` : ''}
      </ul>
      <p>Good luck with your interview!</p>
    `;

    const recruiterHtml = `
      <h2>Interview Scheduled</h2>
      <p>You have scheduled an interview:</p>
      <ul>
        <li><strong>Candidate:</strong> ${interviewDetails.candidateName}</li>
        <li><strong>Position:</strong> ${interviewDetails.jobTitle}</li>
        <li><strong>Date & Time:</strong> ${new Date(interviewDetails.dateTime).toLocaleString()}</li>
        <li><strong>Duration:</strong> ${interviewDetails.duration} minutes</li>
        ${interviewDetails.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></li>` : ''}
      </ul>
    `;

    await Promise.all([
      this.sendEmail(candidateEmail, 'Interview Scheduled', candidateHtml),
      this.sendEmail(recruiterEmail, 'Interview Scheduled', recruiterHtml)
    ]);
  }

  // Interview reminder
  async sendInterviewReminder(email, interviewDetails, hoursUntil) {
    const html = `
      <h2>Interview Reminder</h2>
      <p>Your interview is coming up in ${hoursUntil} hours!</p>
      <ul>
        <li><strong>Position:</strong> ${interviewDetails.jobTitle}</li>
        <li><strong>Date & Time:</strong> ${new Date(interviewDetails.dateTime).toLocaleString()}</li>
        ${interviewDetails.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></li>` : ''}
      </ul>
      <p>Make sure you're prepared and on time!</p>
    `;

    await this.sendEmail(email, `Interview Reminder - ${hoursUntil}h`, html);
  }

  // Match notification
  async sendMatchNotification(candidateEmail, matchDetails) {
    const html = `
      <h2>New Job Match Found!</h2>
      <p>We found a great match for you:</p>
      <ul>
        <li><strong>Position:</strong> ${matchDetails.jobTitle}</li>
        <li><strong>Company:</strong> ${matchDetails.company}</li>
        <li><strong>Match Score:</strong> ${matchDetails.matchScore}%</li>
        <li><strong>Location:</strong> ${matchDetails.location}</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/jobs/${matchDetails.jobId}">View Job Details</a></p>
    `;

    await this.sendEmail(candidateEmail, 'New Job Match Found!', html);
  }

  // Send WhatsApp notification using Twilio (placeholder)
  async sendWhatsAppNotification(phoneNumber, message) {
    try {
      // Twilio WhatsApp integration would go here
      console.log(`WhatsApp to ${phoneNumber}: ${message}`);
      
      // Example with Twilio:
      // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   from: process.env.TWILIO_WHATSAPP_NUMBER,
      //   to: `whatsapp:${phoneNumber}`,
      //   body: message
      // });
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
