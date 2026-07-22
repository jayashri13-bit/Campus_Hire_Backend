const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/admin/job/add:
 *   post:
 *     summary: Add a new job posting or save as draft
 *     description: Creates a new job posting. If action is "draft", it is saved as a draft. If action is "post", it is published. Protected (admin only).
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - jobRoleOverview
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Google
 *               location:
 *                 type: string
 *                 example: Bangalore, India
 *               jobRequirements:
 *                 type: string
 *                 example: HTML, CSS, JavaScript, Node.js
 *               jobRoleOverview:
 *                 type: string
 *                 example: Software Engineering Intern
 *               degree:
 *                 type: string
 *                 example: B.Tech
 *               branch:
 *                 type: string
 *                 example: Computer Science
 *               minCgpa:
 *                 type: number
 *                 example: 8.0
 *               passingYear:
 *                 type: string
 *                 example: "2026"
 *               experience:
 *                 type: string
 *                 example: fresher
 *               deadline:
 *                 type: string
 *                 example: "20-07-2026"
 *               action:
 *                 type: string
 *                 enum: [post, draft]
 *                 example: post
 *     responses:
 *       201:
 *         description: Job posting created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Server error
 */
router.post('/admin/job/add', authenticateToken, isAdmin, jobController.addJobPosting);

/**
 * @swagger
 * /api/admin/drafts:
 *   get:
 *     summary: Get all saved job drafts
 *     description: Fetches a list of all job postings that are in "draft" status. Protected (admin only).
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of drafts returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Server error
 */
router.get('/admin/drafts', authenticateToken, isAdmin, jobController.getDrafts);

/**
 * @swagger
 * /api/admin/draft/{id}:
 *   get:
 *     summary: Get details of a job draft by ID
 *     description: Fetches details of a specific job draft for editing. Protected (admin only).
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The draft ID
 *     responses:
 *       200:
 *         description: Draft details returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Draft not found
 *       500:
 *         description: Server error
 */
router.get('/admin/draft/:id', authenticateToken, isAdmin, jobController.getDraftById);

/**
 * @swagger
 * /api/admin/draft/publish/{id}:
 *   put:
 *     summary: Publish a saved draft
 *     description: Changes the status of a job draft to "published", making it active. Protected (admin only).
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The draft ID
 *     responses:
 *       200:
 *         description: Draft published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Draft not found
 *       500:
 *         description: Server error
 */
router.put('/admin/draft/publish/:id', authenticateToken, isAdmin, jobController.publishDraft);

/**
 * @swagger
 * /api/jobs/published:
 *   get:
 *     summary: Get all active (published) job postings
 *     description: Fetches a list of all active (published) job postings. Public.
 *     tags:
 *       - Jobs
 *     responses:
 *       200:
 *         description: List of active job postings returned successfully
 *       500:
 *         description: Server error
 */
router.get('/jobs/published', jobController.getPublishedJobs);

module.exports = router;
