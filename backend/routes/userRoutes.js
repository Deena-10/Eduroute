// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const connection = require('../config/mysql');

// =======================
// Save User Profile and Roadmap
// =======================
router.post('/save-profile', authMiddleware, async (req, res) => {
  const { profile, roadmap } = req.body;
  const userId = req.user.id;

  try {
    // Save user profile
    const profileData = {
      user_id: userId,
      education_grade: profile.education.grade,
      education_department: profile.education.department,
      education_year: profile.education.year,
      interests: JSON.stringify(profile.interests),
      skills_learned: JSON.stringify(profile.skillsLearned),
      skills_to_learn: JSON.stringify(profile.skillsToLearn),
      planning_days: profile.planningDays,
      email: profile.email,
      phone: profile.phone,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Check if profile exists
    connection.query(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
          // Update existing profile
          connection.query(
            'UPDATE user_profiles SET ? WHERE user_id = ?',
            [profileData, userId],
            (err) => {
              if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ success: false, message: 'Failed to update profile' });
              }
              saveRoadmap();
            }
          );
        } else {
          // Insert new profile
          connection.query(
            'INSERT INTO user_profiles SET ?',
            [profileData],
            (err) => {
              if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({ success: false, message: 'Failed to save profile' });
              }
              saveRoadmap();
            }
          );
        }
      }
    );

    function saveRoadmap() {
      if (roadmap) {
        const roadmapData = {
          user_id: userId,
          roadmap_content: roadmap,
          status: 'active',
          progress_percentage: 0,
          created_at: new Date(),
          updated_at: new Date()
        };

        connection.query(
          'INSERT INTO user_roadmaps SET ?',
          [roadmapData],
          (err) => {
            if (err) {
              console.error('Roadmap save error:', err);
              return res.status(500).json({ success: false, message: 'Failed to save roadmap' });
            }
            res.json({ success: true, message: 'Profile and roadmap saved successfully' });
          }
        );
      } else {
        res.json({ success: true, message: 'Profile saved successfully' });
      }
    }
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =======================
// Get User Profile
// =======================
router.get('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    connection.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
          return res.json({ success: true, profile: null });
        }

        const profile = results[0];
        profile.interests = JSON.parse(profile.interests || '[]');
        profile.skills_learned = JSON.parse(profile.skills_learned || '[]');
        profile.skills_to_learn = JSON.parse(profile.skills_to_learn || '[]');

        res.json({ success: true, profile });
      }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =======================
// Get User Roadmap
// =======================
router.get('/roadmap', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    connection.query(
      'SELECT * FROM user_roadmaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
          return res.json({ success: true, roadmap: null });
        }

        res.json({ success: true, roadmap: results[0] });
      }
    );
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =======================
// Update Roadmap Progress
// =======================
router.put('/roadmap/progress', authMiddleware, async (req, res) => {
  const { progress_percentage, completed_tasks } = req.body;
  const userId = req.user.id;

  try {
    connection.query(
      'UPDATE user_roadmaps SET progress_percentage = ?, completed_tasks = ?, updated_at = ? WHERE user_id = ? AND status = "active"',
      [progress_percentage, JSON.stringify(completed_tasks), new Date(), userId],
      (err, result) => {
        if (err) {
          console.error('Update progress error:', err);
          return res.status(500).json({ success: false, message: 'Failed to update progress' });
        }

        // Check if progress reached milestones for notifications
        if (progress_percentage >= 40 && progress_percentage < 60) {
          // Suggest events/conferences
          suggestEvents(userId);
        } else if (progress_percentage >= 60 && progress_percentage < 80) {
          // Suggest projects
          suggestProjects(userId);
        } else if (progress_percentage >= 80) {
          // Suggest job openings
          suggestJobOpenings(userId);
        }

        res.json({ success: true, message: 'Progress updated successfully' });
      }
    );
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =======================
// Get User Progress
// =======================
router.get('/progress', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    connection.query(
      'SELECT progress_percentage, completed_tasks, created_at, updated_at FROM user_roadmaps WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
          return res.json({ success: true, progress: { percentage: 0, tasks: [] } });
        }

        const progress = results[0];
        progress.completed_tasks = JSON.parse(progress.completed_tasks || '[]');

        res.json({ success: true, progress });
      }
    );
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =======================
// Helper Functions
// =======================

function suggestEvents(userId) {
  // This would integrate with event APIs or database
  console.log(`Suggesting events for user ${userId} (40% progress milestone)`);
  // TODO: Implement event suggestion logic
}

function suggestProjects(userId) {
  // This would suggest relevant projects based on user's skills and interests
  console.log(`Suggesting projects for user ${userId} (60% progress milestone)`);
  // TODO: Implement project suggestion logic
}

function suggestJobOpenings(userId) {
  // This would integrate with job APIs or database
  console.log(`Suggesting job openings for user ${userId} (80% progress milestone)`);
  // TODO: Implement job opening suggestion logic
}

module.exports = router;
