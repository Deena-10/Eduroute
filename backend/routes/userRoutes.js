// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/postgres');

// PostgreSQL JSONB returns parsed objects - don't double-parse
const parseJsonField = (val, fallback = []) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val) || fallback;
  } catch {
    return fallback;
  }
};

router.post('/save-profile', authMiddleware, async (req, res) => {
  const { profile, roadmap } = req.body;
  const userId = req.user.id;

  try {
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
    };

    const { rows: existing } = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE user_profiles SET
          education_grade = $1, education_department = $2, education_year = $3,
          interests = $4, skills_learned = $5, skills_to_learn = $6,
          planning_days = $7, email = $8, phone = $9, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $10`,
        [
          profileData.education_grade,
          profileData.education_department,
          profileData.education_year,
          profileData.interests,
          profileData.skills_learned,
          profileData.skills_to_learn,
          profileData.planning_days,
          profileData.email,
          profileData.phone,
          userId
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO user_profiles (user_id, education_grade, education_department, education_year, interests, skills_learned, skills_to_learn, planning_days, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          profileData.user_id,
          profileData.education_grade,
          profileData.education_department,
          profileData.education_year,
          profileData.interests,
          profileData.skills_learned,
          profileData.skills_to_learn,
          profileData.planning_days,
          profileData.email,
          profileData.phone
        ]
      );
    }

    if (roadmap) {
      await pool.query(
        `INSERT INTO user_roadmaps (user_id, roadmap_content, status, progress_percentage)
         VALUES ($1, $2, 'active', 0)`,
        [userId, roadmap]
      );
    }

    res.json({ success: true, message: roadmap ? 'Profile and roadmap saved successfully' : 'Profile saved successfully' });
  } catch (err) {
    console.error('Save profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, profile: null });
    }

    const profile = rows[0];
        profile.interests = parseJsonField(profile.interests);
        profile.skills_learned = parseJsonField(profile.skills_learned);
        profile.skills_to_learn = parseJsonField(profile.skills_to_learn);

    res.json({ success: true, profile });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/roadmap', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_roadmaps WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'active']
    );

    if (rows.length === 0) {
      return res.json({ success: true, roadmap: null });
    }

    res.json({ success: true, roadmap: rows[0] });
  } catch (err) {
    console.error('Get roadmap error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/user/roadmap — reset/remove active roadmap (domain unlock; nav shows Create Roadmap again)
router.delete('/roadmap', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query(
      `UPDATE user_roadmaps SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND status = $3`,
      ['paused', userId, 'active']
    );
    res.json({ success: true, message: 'Roadmap reset. You can create a new roadmap and choose a different domain.' });
  } catch (err) {
    console.error('Reset roadmap error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/roadmap/progress', authMiddleware, async (req, res) => {
  const { progress_percentage, completed_tasks } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      `UPDATE user_roadmaps SET progress_percentage = $1, completed_tasks = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND status = 'active'`,
      [progress_percentage, JSON.stringify(completed_tasks || []), userId]
    );

    if (progress_percentage >= 40 && progress_percentage < 60) {
      console.log(`Suggesting events for user ${userId} (40% progress milestone)`);
    } else if (progress_percentage >= 60 && progress_percentage < 80) {
      console.log(`Suggesting projects for user ${userId} (60% progress milestone)`);
    } else if (progress_percentage >= 80) {
      console.log(`Suggesting job openings for user ${userId} (80% progress milestone)`);
    }

    res.json({ success: true, message: 'Progress updated successfully' });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/progress', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      'SELECT progress_percentage, completed_tasks, created_at, updated_at FROM user_roadmaps WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'active']
    );

    if (rows.length === 0) {
      return res.json({ success: true, progress: { percentage: 0, tasks: [] } });
    }

    const progress = rows[0];
    progress.completed_tasks = parseJsonField(progress.completed_tasks);

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Flatten all task ids from roadmap JSON for total count and validation
function getFlatTaskIds(roadmapContent) {
  if (!roadmapContent || !roadmapContent.phases) return [];
  const ids = [];
  (roadmapContent.phases || [])
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((phase) => {
      (phase.topics || []).forEach((topic) => {
        (topic.tasks || []).forEach((t) => ids.push(t.id));
      });
    });
  return ids;
}

// POST /api/user/roadmap/complete-task — mark task complete, update progress and streak
router.post('/roadmap/complete-task', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { taskId } = req.body;
  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ success: false, message: 'taskId is required' });
  }

  try {
    const { rows: roadmapRows } = await pool.query(
      'SELECT id, roadmap_content, completed_tasks FROM user_roadmaps WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'active']
    );
    if (roadmapRows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active roadmap' });
    }

    const roadmap = roadmapRows[0];
    let content = roadmap.roadmap_content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid roadmap content' });
      }
    }

    const allTaskIds = getFlatTaskIds(content);
    if (!allTaskIds.includes(taskId)) {
      return res.status(400).json({ success: false, message: 'Task not found in roadmap' });
    }

    let completedTasks = parseJsonField(roadmap.completed_tasks);
    if (completedTasks.includes(taskId)) {
      const progressPct = allTaskIds.length ? Math.round((completedTasks.length / allTaskIds.length) * 100) : 0;
      const { rows: streakRows } = await pool.query(
        'SELECT current_streak, last_activity_date FROM user_learning_streak WHERE user_id = $1',
        [userId]
      );
      const streak = streakRows[0] ? { current_streak: streakRows[0].current_streak, last_activity_date: streakRows[0].last_activity_date } : { current_streak: 0, last_activity_date: null };
      return res.json({ success: true, progress_percentage: progressPct, completed_tasks: completedTasks, streak });
    }

    completedTasks = [...completedTasks, taskId];
    const progressPercentage = allTaskIds.length ? Math.min(100, Math.round((completedTasks.length / allTaskIds.length) * 100)) : 0;

    await pool.query(
      `UPDATE user_roadmaps SET progress_percentage = $1, completed_tasks = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND status = 'active'`,
      [progressPercentage, JSON.stringify(completedTasks), userId]
    );

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const { rows: streakRows } = await pool.query(
      'SELECT current_streak, last_activity_date FROM user_learning_streak WHERE user_id = $1',
      [userId]
    );

    let newStreak = 1;
    const lastDate = streakRows[0] ? (streakRows[0].last_activity_date ? new Date(streakRows[0].last_activity_date).toISOString().slice(0, 10) : null) : null;
    if (lastDate === today) {
      newStreak = streakRows[0].current_streak;
    } else if (lastDate === yesterday) {
      newStreak = (streakRows[0].current_streak || 0) + 1;
    }

    await pool.query(
      `INSERT INTO user_learning_streak (user_id, current_streak, last_activity_date, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET current_streak = $2, last_activity_date = $3, updated_at = CURRENT_TIMESTAMP`,
      [userId, newStreak, today]
    );

    res.json({
      success: true,
      progress_percentage: progressPercentage,
      completed_tasks: completedTasks,
      streak: { current_streak: newStreak, last_activity_date: today },
    });
  } catch (err) {
    console.error('Complete task error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/user/streak — learning streak for current user
router.get('/streak', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      'SELECT current_streak, last_activity_date FROM user_learning_streak WHERE user_id = $1',
      [userId]
    );
    if (rows.length === 0) {
      return res.json({ success: true, current_streak: 0, last_activity_date: null });
    }
    res.json({
      success: true,
      current_streak: rows[0].current_streak,
      last_activity_date: rows[0].last_activity_date,
    });
  } catch (err) {
    console.error('Get streak error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
