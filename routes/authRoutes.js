const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

/**
 * @swagger
 * /api/auth/register/student:
 *   post:
 *     summary: Register a new student
 *     description: Creates a user account with the role "student" and a corresponding student profile using fields from the frontend form.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - confirmPassword
 *               - mobile
 *               - dob
 *               - department
 *               - course
 *               - currentYear
 *               - cgpa
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Priya Sharma
 *               email:
 *                 type: string
 *                 example: priya@college.edu.in
 *               password:
 *                 type: string
 *                 example: securepassword123
 *               confirmPassword:
 *                 type: string
 *                 example: securepassword123
 *               mobile:
 *                 type: string
 *                 example: "8765443789"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "15-05-2004"
 *               department:
 *                 type: string
 *                 example: Computer Science & Engineering
 *               course:
 *                 type: string
 *                 example: B.Tech
 *               currentYear:
 *                 type: integer
 *                 example: 3
 *               cgpa:
 *                 type: number
 *                 format: float
 *                 example: 8.75
 *     responses:
 *       201:
 *         description: Student registered successfully!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student registered successfully!
 *                 userId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email is already registered
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post('/register/student', authController.registerStudent);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a student or admin using their email, password, and confirmPassword, and returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: priya@college.edu.in
 *               password:
 *                 type: string
 *                 example: securepassword123
 *               confirmPassword:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Login successful!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Priya Sharma
 *                     email:
 *                       type: string
 *                       example: priya@college.edu.in
 *                     role:
 *                       type: string
 *                       example: student
 *       400:
 *         description: Validation error or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Passwords do not match
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post('/login', authController.login);

module.exports = router;
