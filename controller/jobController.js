const db = require('../config/db');

// Helper to parse dates in format 'DD-MM-YYYY' to standard Date object
const parseDeadlineDate = (deadlineStr) => {
    if (!deadlineStr) return null;
    const parts = deadlineStr.split('-');
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
        // dd-mm-yyyy -> yyyy-mm-dd
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return deadlineStr; // Fallback to raw string (which database can parse if standard format)
};

/**
 * Create a new job posting (Draft or Published)
 */
exports.addJobPosting = async (req, res) => {
    const {
        companyName,
        location,
        jobRequirements,
        jobRoleOverview,
        degree,
        branch,
        minCgpa,
        passingYear,
        experience,
        deadline,
        action
    } = req.body;

    // Validate minimum required fields (depending on draft vs publish)
    if (action === 'draft') {
        if (!companyName || !jobRoleOverview) {
            return res.status(400).json({ error: "Company name and job role overview are required to save a draft." });
        }
    } else {
        if (!companyName || !jobRoleOverview || !jobRequirements) {
            return res.status(400).json({ error: "Company name, job role overview, and job requirements are required." });
        }
    }

    const status = action === 'draft' ? 'draft' : 'published';
    const parsedDeadline = deadline ? parseDeadlineDate(deadline) : null;
    const cgpaVal = minCgpa ? parseFloat(minCgpa) : 0.0;

    try {
        const query = `
            INSERT INTO job_postings (
                company_name,
                location,
                job_requirements,
                job_role_overview,
                degree,
                branch,
                min_cgpa,
                passing_year,
                experience,
                deadline,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const result = await db.query(query, [
            companyName,
            location || 'Remote',
            jobRequirements || 'None',
            jobRoleOverview,
            degree || 'B.Tech',
            branch || 'Computer Science',
            cgpaVal,
            passingYear || '2026',
            experience || 'fresher',
            parsedDeadline,
            status
        ]);

        const job = result.rows[0];

        // Format return to match the frontend expectations
        return res.status(201).json({
            id: job.id,
            companyName: job.company_name,
            location: job.location,
            jobRequirements: job.job_requirements,
            jobRoleOverview: job.job_role_overview,
            degree: job.degree,
            branch: job.branch,
            minCgpa: job.min_cgpa,
            passingYear: job.passing_year,
            experience: job.experience,
            deadline: job.deadline,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at
        });

    } catch (error) {
        console.error("Error creating job posting:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Get all drafts
 */
exports.getDrafts = async (req, res) => {
    try {
        const query = `
            SELECT * FROM job_postings 
            WHERE status = 'draft' 
            ORDER BY updated_at DESC
        `;
        const result = await db.query(query);

        // Map results to match frontend format
        const formatted = result.rows.map(job => ({
            id: job.id,
            companyName: job.company_name,
            location: job.location,
            jobRequirements: job.job_requirements,
            jobRoleOverview: job.job_role_overview,
            degree: job.degree,
            branch: job.branch,
            minCgpa: job.min_cgpa,
            passingYear: job.passing_year,
            experience: job.experience,
            deadline: job.deadline,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Error fetching drafts:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Get draft by ID
 */
exports.getDraftById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT * FROM job_postings 
            WHERE id = $1 AND status = 'draft'
        `;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Draft not found." });
        }

        const job = result.rows[0];
        return res.status(200).json({
            id: job.id,
            companyName: job.company_name,
            location: job.location,
            jobRequirements: job.job_requirements,
            jobRoleOverview: job.job_role_overview,
            degree: job.degree,
            branch: job.branch,
            minCgpa: job.min_cgpa,
            passingYear: job.passing_year,
            experience: job.experience,
            deadline: job.deadline,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at
        });
    } catch (error) {
        console.error("Error fetching draft by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Publish a draft
 */
exports.publishDraft = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            UPDATE job_postings 
            SET status = 'published', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND status = 'draft'
            RETURNING *
        `;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Draft not found or already published." });
        }

        const job = result.rows[0];
        return res.status(200).json({
            id: job.id,
            companyName: job.company_name,
            location: job.location,
            jobRequirements: job.job_requirements,
            jobRoleOverview: job.job_role_overview,
            degree: job.degree,
            branch: job.branch,
            minCgpa: job.min_cgpa,
            passingYear: job.passing_year,
            experience: job.experience,
            deadline: job.deadline,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at
        });
    } catch (error) {
        console.error("Error publishing draft:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Get all published jobs
 */
exports.getPublishedJobs = async (req, res) => {
    try {
        const query = `
            SELECT * FROM job_postings 
            WHERE status = 'published' 
            ORDER BY created_at DESC
        `;
        const result = await db.query(query);

        const formatted = result.rows.map(job => ({
            id: job.id,
            companyName: job.company_name,
            location: job.location,
            jobRequirements: job.job_requirements,
            jobRoleOverview: job.job_role_overview,
            degree: job.degree,
            branch: job.branch,
            minCgpa: job.min_cgpa,
            passingYear: job.passing_year,
            experience: job.experience,
            deadline: job.deadline,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Error fetching published jobs:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
