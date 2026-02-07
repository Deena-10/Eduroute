// backend/service/notifications.js
const pool = require('../config/postgres');
const nodemailer = require('nodemailer');

const parseJsonField = (val, fallback = []) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val) || fallback;
  } catch {
    return fallback;
  }
};

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendDailyReminders = async () => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, up.planning_days, ur.progress_percentage, ur.roadmap_content
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      JOIN user_roadmaps ur ON u.id = ur.user_id
      WHERE ur.status = 'active' AND ur.progress_percentage < 100
    `);

    for (const user of rows) {
      await sendDailyReminder(user);
    }
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
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/questionnaire" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Continue Your Journey
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 EduRoute AI. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: subject,
      html: html
    });

    saveNotification(user.id, 'daily_reminder', 'Daily Reminder', 'Your daily career roadmap reminder has been sent.');
    console.log(`Daily reminder sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending daily reminder to ${user.email}:`, error);
  }
};

const sendMilestoneNotification = async (userId, milestone) => {
  try {
    const { rows } = await pool.query(
      'SELECT u.name, u.email, up.interests FROM users u JOIN user_profiles up ON u.id = up.user_id WHERE u.id = $1',
      [userId]
    );

    if (rows.length === 0) return;

    const user = rows[0];
    const interests = parseJsonField(user.interests);

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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Milestone Achieved!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You've reached ${milestone}% of your career roadmap</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${user.name}!</h2>
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #666; line-height: 1.6; font-size: 16px;">${message}</p>
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

    saveNotification(userId, notificationType, `Milestone ${milestone}%`, message);
    console.log(`Milestone notification sent to ${user.email} for ${milestone}%`);
  } catch (error) {
    console.error('Error sending milestone notification:', error);
  }
};

const saveNotification = (userId, type, title, message) => {
  pool.query(
    'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
    [userId, type, title, message]
  ).catch((err) => console.error('Error saving notification:', err));
};

const getUserNotifications = (userId, callback) => {
  pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [userId]
  )
    .then(({ rows }) => callback(null, rows))
    .catch((err) => {
      console.error('Error fetching notifications:', err);
      callback(err, null);
    });
};

const markNotificationAsRead = (notificationId, userId, callback) => {
  pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  )
    .then(() => callback(null))
    .catch((err) => {
      console.error('Error marking notification as read:', err);
      callback(err);
    });
};

module.exports = {
  sendDailyReminders,
  sendMilestoneNotification,
  getUserNotifications,
  markNotificationAsRead,
  saveNotification
};
