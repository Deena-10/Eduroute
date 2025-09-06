// backend/service/notifications.js
const connection = require('../config/mysql');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// =======================
// Daily Reminder Service
// =======================
const sendDailyReminders = async () => {
  try {
    // Get all active roadmaps
    const query = `
      SELECT u.id, u.name, u.email, up.planning_days, ur.progress_percentage, ur.roadmap_content
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      JOIN user_roadmaps ur ON u.id = ur.user_id
      WHERE ur.status = 'active' AND ur.progress_percentage < 100
    `;

    connection.query(query, async (err, results) => {
      if (err) {
        console.error('Error fetching users for daily reminders:', err);
        return;
      }

      for (const user of results) {
        await sendDailyReminder(user);
      }
    });
  } catch (error) {
    console.error('Error in daily reminder service:', error);
  }
};

const sendDailyReminder = async (user) => {
  try {
    const subject = '🚀 Your Daily Career Roadmap Reminder';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Career Roadmap Daily Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Keep moving forward on your career journey!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}!</h2>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">Your Progress</h3>
            <div style="background: #e9ecef; border-radius: 5px; height: 20px; margin: 10px 0;">
              <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; border-radius: 5px; width: ${user.progress_percentage}%;"></div>
            </div>
            <p style="margin: 5px 0; color: #666;">${user.progress_percentage}% completed</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">Today's Focus</h3>
            <p style="color: #666; line-height: 1.6;">
              Take a moment today to work on your career goals. Even 30 minutes of focused learning can make a big difference!
            </p>
            <ul style="color: #666; line-height: 1.6;">
              <li>Review your roadmap progress</li>
              <li>Complete one learning task</li>
              <li>Practice your skills</li>
              <li>Update your portfolio</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/questionnaire" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Continue Your Journey
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 EduRoute AI. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">You can unsubscribe from these emails in your profile settings.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: subject,
      html: html
    });

    // Save notification to database
    saveNotification(user.id, 'daily_reminder', 'Daily Reminder', 'Your daily career roadmap reminder has been sent.');

    console.log(`Daily reminder sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending daily reminder to ${user.email}:`, error);
  }
};

// =======================
// Milestone Notifications
// =======================
const sendMilestoneNotification = async (userId, milestone) => {
  try {
    // Get user details
    connection.query(
      'SELECT u.name, u.email, up.interests FROM users u JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?',
      [userId],
      async (err, results) => {
        if (err || results.length === 0) {
          console.error('Error fetching user for milestone notification:', err);
          return;
        }

        const user = results[0];
        const interests = JSON.parse(user.interests || '[]');

        let subject, message, notificationType;

        switch (milestone) {
          case 40:
            subject = '🎉 40% Milestone Reached! Time for Events & Networking';
            message = `Congratulations! You've reached 40% of your career roadmap. It's time to start networking and attending events in your field.`;
            notificationType = 'event_suggestion';
            break;
          case 60:
            subject = '🚀 60% Milestone! Ready for Real Projects';
            message = `Amazing progress! You've completed 60% of your roadmap. Let's start working on real projects to showcase your skills.`;
            notificationType = 'project_suggestion';
            break;
          case 80:
            subject = '💼 80% Complete! Job Opportunities Await';
            message = `Fantastic! You're 80% through your roadmap. Start exploring job opportunities and preparing for interviews.`;
            notificationType = 'job_opening';
            break;
          default:
            return;
        }

        // Send email
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">🎉 Milestone Achieved!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You've reached ${milestone}% of your career roadmap</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${user.name}!</h2>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p style="color: #666; line-height: 1.6; font-size: 16px;">
                  ${message}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/questionnaire" 
                   style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  View Your Progress
                </a>
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: subject,
          html: html
        });

        // Save notification to database
        saveNotification(userId, notificationType, `Milestone ${milestone}%`, message);

        console.log(`Milestone notification sent to ${user.email} for ${milestone}%`);
      }
    );
  } catch (error) {
    console.error('Error sending milestone notification:', error);
  }
};

// =======================
// Save Notification to Database
// =======================
const saveNotification = (userId, type, title, message) => {
  const notificationData = {
    user_id: userId,
    type: type,
    title: title,
    message: message,
    is_read: false
  };

  connection.query(
    'INSERT INTO notifications SET ?',
    [notificationData],
    (err) => {
      if (err) {
        console.error('Error saving notification:', err);
      }
    }
  );
};

// =======================
// Get User Notifications
// =======================
const getUserNotifications = (userId, callback) => {
  const query = `
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// =======================
// Mark Notification as Read
// =======================
const markNotificationAsRead = (notificationId, userId, callback) => {
  connection.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [notificationId, userId],
    (err, result) => {
      if (err) {
        console.error('Error marking notification as read:', err);
        callback(err);
      } else {
        callback(null);
      }
    }
  );
};

module.exports = {
  sendDailyReminders,
  sendMilestoneNotification,
  getUserNotifications,
  markNotificationAsRead,
  saveNotification
};
