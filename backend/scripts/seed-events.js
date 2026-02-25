// Run: node scripts/seed-events.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../config/postgres");

const SAMPLE_EVENTS = [
    { type: "webinar", title: "Introduction to Python for Beginners", description: "Live webinar covering Python basics.", domain: "Python", level: "beginner", url: "https://example.com/python-webinar" },
    { type: "webinar", title: "Data Science Career Path", description: "Learn how to transition into data science.", domain: "Data Science", level: "intermediate", url: "https://example.com/ds-webinar" },
    { type: "event", title: "Tech Career Fair 2025", description: "Virtual career fair with top companies.", domain: null, level: null, url: "https://example.com/career-fair" },
    { type: "job", title: "Junior Python Developer", description: "Entry-level Python role at a growing startup.", domain: "Python", level: "beginner", url: "https://example.com/jobs/python-jr" },
    { type: "job", title: "Frontend Developer (React)", description: "Frontend role requiring React experience.", domain: "Web Development", level: "intermediate", url: "https://example.com/jobs/react" },
];

async function seed() {
    try {
        const { rowCount } = await pool.query("SELECT 1 FROM career_events LIMIT 1");
        if (rowCount > 0) {
            console.log("Events already seeded.");
            process.exit(0);
            return;
        }
        for (const e of SAMPLE_EVENTS) {
            await pool.query(
                "INSERT INTO career_events (type, title, description, url, domain, level, event_date) VALUES ($1, $2, $3, $4, $5, $6, NOW() + interval '1 day' * floor(random() * 30))",
                [e.type, e.title, e.description, e.url, e.domain, e.level]
            );
        }
        console.log("Seeded", SAMPLE_EVENTS.length, " events.");
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        pool.end();
    }
}
seed();
