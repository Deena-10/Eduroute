const aiService = require("../services/aiService");
const { prisma } = require("../config/prisma");

/* =========================================
   1. AI SERVICE HEALTH CHECK
========================================= */
exports.healthCheck = async (req, res) => {
    const base = aiService.AI_SERVICE_URL;
    try {
        const response = await aiService.get("/health", {}, { timeout: 15000 });
        return res.status(200).json({
            success: true,
            aiServiceBaseUrl: base,
            aiService: response.data,
            message: "AI service connected",
        });
    } catch (error) {
        console.error("AI Health Check Error:", error.message, "→", base);
        return res.status(503).json({
            success: false,
            message: "AI service unavailable",
            aiServiceBaseUrl: base,
            hint:
                "On Render, set AI_SERVICE_URL on the Node backend to your Python service URL (https://…, no trailing slash). " +
                "Put GEMINI_API_KEY (or similar) on the Python service. First request after sleep can take 30–60s.",
            detail: error.code || error.message,
        });
    }
};

/* =========================================
   2. CHAT WITH AI
========================================= */
exports.chat = async (req, res, next) => {
    const { message } = req.body;
    try {
        const response = await aiService.postWithRetry("/ask_ai", {
            question: message,
            uid: req.user.id,
        });
        return res.status(200).json({
            success: true,
            reply: response.data.answer,
        });
    } catch (error) {
        console.error("Chat error:", error.message);
        next(error);
    }
};

/* =========================================
   NORMALIZE: Max 4-5 MCQs per chapter; move excess to next chapter
========================================= */
const MAX_MCQS_PER_CHAPTER = 5;

function normalizeRoadmapUnits(roadmapPayload, domain) {
    const units = roadmapPayload?.roadmap?.units || roadmapPayload?.units || [];
    if (units.length === 0) return roadmapPayload;

    const domainKey = domain || roadmapPayload?.roadmap?.domain || "General";
    const result = [];
    let overflow = [];

    for (const u of units) {
        const mcqs = Array.isArray(u.mcqs) ? [...u.mcqs] : [];
        const unitCopy = { ...u, mcqs: overflow.length ? [...overflow, ...mcqs] : mcqs };
        overflow = [];

        if (unitCopy.mcqs.length > MAX_MCQS_PER_CHAPTER) {
            overflow = unitCopy.mcqs.slice(MAX_MCQS_PER_CHAPTER);
            unitCopy.mcqs = unitCopy.mcqs.slice(0, MAX_MCQS_PER_CHAPTER);
        }
        result.push(unitCopy);
    }

    while (overflow.length > 0) {
        const last = result[result.length - 1];
        const newUnitNum = (last?.unit_number ?? result.length) + 1;
        const take = Math.min(MAX_MCQS_PER_CHAPTER, overflow.length);
        const mcqsForUnit = overflow.splice(0, take);
        result.push({
            unit_number: newUnitNum,
            title: `${domainKey} — Chapter ${newUnitNum}`,
            level: "intermediate",
            tasks: [{ task_id: `u${newUnitNum}_t1`, task_name: "Task 1" }, { task_id: `u${newUnitNum}_t2`, task_name: "Task 2" }, { task_id: `u${newUnitNum}_t3`, task_name: "Task 3" }, { task_id: `u${newUnitNum}_t4`, task_name: "Task 4" }],
            mcqs: mcqsForUnit,
        });
    }

    const base = roadmapPayload.roadmap || roadmapPayload;
    const nodeConfig = (roadmapPayload.ui_metadata?.node_config || []).slice(0, result.length);
    for (let i = nodeConfig.length; i < result.length; i++) {
        nodeConfig.push({ unit: result[i].unit_number, offset: i % 2 ? "right" : "left", color: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"][i % 5] });
    }

    return {
        ...roadmapPayload,
        roadmap: { ...base, units: result },
        ui_metadata: { ...(roadmapPayload.ui_metadata || {}), node_config: nodeConfig },
    };
}

/* =========================================
   FALLBACK: Generate roadmap when AI service is down
========================================= */
function buildFallbackRoadmap(domain) {
    const colors = ["#3B82F6", "#10B981", "#F59E0B"];
    const units = [];
    for (let i = 1; i <= 3; i++) {
        const level = i <= 1 ? "beginner" : i <= 2 ? "intermediate" : "advanced";
        const titles = [
            `Getting started with ${domain}`,
            `Core skills in ${domain}`,
            `Advanced ${domain} mastery`,
        ];
        units.push({
            unit_number: i,
            title: titles[i - 1],
            level,
            tasks: [
                { task_id: `u${i}_t1`, task_name: `Task 1` },
                { task_id: `u${i}_t2`, task_name: `Task 2` },
                { task_id: `u${i}_t3`, task_name: `Task 3` },
                { task_id: `u${i}_t4`, task_name: `Task 4` },
            ],
            mcqs: [
                { question: `What is the main focus of "${titles[i - 1]}" in ${domain}?`, options: ["Building foundational skills", "Memorizing only", "Skipping practice", "Avoiding hands-on work"], correctIndex: 0 },
                { question: `In "${titles[i - 1]}", which approach best supports progress?`, options: ["Applying concepts through exercises", "Reading only", "Copying blindly", "Skipping"], correctIndex: 0 },
                { question: `How does "${titles[i - 1]}" fit into your ${domain} path?`, options: ["Establishes skills for next level", "Optional", "Replaces others", "No connection"], correctIndex: 0 },
                { question: `After "${titles[i - 1]}", what should you be able to do?`, options: ["Explain and apply key concepts", "Only recall definitions", "Move on without practice", "Ignore next chapter"], correctIndex: 0 },
                { question: `Why is "${titles[i - 1]}" at the ${level} stage?`, options: ["Matches complexity and builds on prior learning", "Random", "Hardest", "Unrelated"], correctIndex: 0 },
            ],
        });
    }
    return {
        isFallback: true,
        roadmap: { domain, units },
        ui_metadata: { node_config: units.map((u, idx) => ({ unit: u.unit_number, offset: idx % 2 ? "right" : "left", color: colors[idx] })) },
        gamification: { daily_streak_goal_xp: 50 },
    };
}

/* =========================================
   3. GENERATE CAREER ROADMAP
   - AI-first: always calls AI service for new domains; uses cache only when domain exists.
   - forceRegenerate: when true, always calls AI and updates domain_roadmaps.
   - Domain-level storage: domain_roadmaps stores AI content; user_roadmaps stores per-user progress.
   - Fallback: if AI service fails, uses buildFallbackRoadmap and still stores in DB.
========================================= */
exports.generateRoadmap = async (req, res) => {
    const { domain, proficiency_level, professional_goal, current_status, forceRegenerate } = req.body;
    const domainKey = (domain || "General").trim();

    try {
        let roadmapPayload;

        // 1. Check domain_roadmaps for existing roadmap (skip cache if forceRegenerate)
        const domainResult = await prisma.domainRoadmap.findUnique({
            where: { domain: domainKey }
        });

        const useCache = domainResult && !forceRegenerate;

        if (useCache) {
            const content = domainResult.roadmap_content;
            roadmapPayload = typeof content === "string" ? JSON.parse(content) : content;
            roadmapPayload = normalizeRoadmapUnits(roadmapPayload, domainKey);
        } else {
            // 2. Generate via AI (or fallback if AI down)
            try {
                const response = await aiService.postWithRetry(
                    "/generate-roadmap",
                    { domain: domainKey, proficiency_level, professional_goal, current_status },
                    { timeout: Number(process.env.AI_ROADMAP_TIMEOUT_MS) || 120000 }
                );
                if (response.data && response.data.roadmap) {
                    roadmapPayload = response.data;
                } else {
                    throw new Error("AI returned invalid structure");
                }
            } catch (aiErr) {
                console.warn("AI service unavailable, using fallback roadmap:", aiErr.message);
                roadmapPayload = buildFallbackRoadmap(domainKey);
            }
            roadmapPayload = normalizeRoadmapUnits(roadmapPayload, domainKey);

            // 3. Store in domain_roadmaps (upsert: insert new or update existing)
            await prisma.domainRoadmap.upsert({
                where: { domain: domainKey },
                update: { roadmap_content: roadmapPayload },
                create: { domain: domainKey, roadmap_content: roadmapPayload }
            });
            console.log(`[DB] Stored roadmap for domain "${domainKey}" in domain_roadmaps`);
        }

        // 4. Pause existing active roadmaps for this user
        await prisma.roadmap.updateMany({
            where: { user_id: req.user.id, status: 'active' },
            data: { status: 'paused' }
        });

        // 5. Create user roadmap (domain-linked; content comes from domain_roadmaps on fetch)
        await prisma.roadmap.create({
            data: {
                user_id: req.user.id,
                domain: domainKey,
                roadmap_content: roadmapPayload,
                status: 'active',
                progress_percentage: 0,
                completed_tasks: []
            }
        });
        console.log(`[DB] Stored user roadmap for user ${req.user.id}, domain "${domainKey}" in user_roadmaps`);

        // 6. Persist mandatory one-time inputs
        const uid = String(req.user.id);
        
        try {
            await prisma.careerOnboardingState.upsert({
                where: { uid: uid },
                update: {
                    step: 'done',
                    domain: domainKey,
                    proficiency_level: proficiency_level || null,
                    professional_goal: professional_goal || null,
                    current_status: current_status || null,
                },
                create: {
                    uid: uid,
                    step: 'done',
                    domain: domainKey,
                    proficiency_level: proficiency_level || null,
                    professional_goal: professional_goal || null,
                    current_status: current_status || null,
                }
            });
        } catch (colError) {
            console.error("Warning: professional_goal might be missing from schema, retrying without it", colError.message);
            await prisma.careerOnboardingState.upsert({
                where: { uid: uid },
                update: {
                    step: 'done',
                    domain: domainKey,
                    proficiency_level: proficiency_level || null,
                    current_status: current_status || null,
                },
                create: {
                    uid: uid,
                    step: 'done',
                    domain: domainKey,
                    proficiency_level: proficiency_level || null,
                    current_status: current_status || null,
                }
            });
        }

        return res.status(200).json({
            success: true,
            roadmap: roadmapPayload,
            message: "Roadmap generated and saved successfully",
        });
    } catch (error) {
        console.error("Generate roadmap error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to generate roadmap",
        });
    }
};

/* =========================================
   4. FETCH ACTIVE ROADMAP (Onboarding State)
========================================= */
exports.getOnboardingState = async (req, res) => {
    try {
        const result = await prisma.roadmap.findFirst({
            where: { user_id: req.user.id, status: 'active' },
            orderBy: { updated_at: 'desc' },
        });

        if (!result) {
            return res.status(200).json({
                success: true,
                hasActiveRoadmap: false,
                roadmap: null,
            });
        }

        return res.status(200).json({
            success: true,
            hasActiveRoadmap: true,
            roadmap: result.roadmap_content,
            progress: result.progress_percentage,
            updatedAt: result.updated_at,
        });

    } catch (error) {
        console.error("Fetch roadmap error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch roadmap state",
        });
    }
};