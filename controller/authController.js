// we need the db pool and bcrypt for password hashing
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerStudent = async (req, res) => {
    // grab fields from request body matching the frontend form payload
    const { fullName, email, password, confirmPassword, mobile, dob, department, course, currentYear, cgpa } = req.body;

    // Check if any required field is missing or empty
    if (
        fullName === undefined || fullName === null || String(fullName).trim() === '' ||
        email === undefined || email === null || String(email).trim() === '' ||
        password === undefined || password === null || String(password).trim() === '' ||
        confirmPassword === undefined || confirmPassword === null || String(confirmPassword).trim() === '' ||
        mobile === undefined || mobile === null || String(mobile).trim() === '' ||
        dob === undefined || dob === null || String(dob).trim() === '' ||
        department === undefined || department === null || String(department).trim() === '' ||
        course === undefined || course === null || String(course).trim() === '' ||
        currentYear === undefined || currentYear === null || String(currentYear).trim() === '' ||
        cgpa === undefined || cgpa === null || String(cgpa).trim() === ''
    ) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // 1. Full Name: >= 3 chars, letters and spaces only
    const nameStr = String(fullName).trim();
    if (nameStr.length < 3) {
        return res.status(400).json({ error: "Name must be at least 3 characters" });
    }
    if (!/^[a-zA-Z\s]+$/.test(nameStr)) {
        return res.status(400).json({ error: "Name can only contain letters and spaces" });
    }

    // 2. Email Address
    const emailStr = String(email).trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailStr)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // 3. Mobile Number: exactly 10 digits
    const mobileStr = String(mobile).trim();
    if (!/^[0-9]{10}$/.test(mobileStr)) {
        return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
    }

    // 4. DOB Validation and robust parsing
    const dobStr = String(dob).trim();
    let formattedDob = dobStr;
    let dobDate;

    if (dobStr.includes('-')) {
        const parts = dobStr.split('-');
        if (parts[0].length === 4) {
            // yyyy-mm-dd
            dobDate = new Date(dobStr);
            formattedDob = dobStr;
        } else if (parts[0].length === 2 && parts[2].length === 4) {
            // dd-mm-yyyy
            formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
            dobDate = new Date(formattedDob);
        } else {
            return res.status(400).json({ error: "Invalid date of birth format" });
        }
    } else {
        dobDate = new Date(dobStr);
    }

    if (isNaN(dobDate.getTime())) {
        return res.status(400).json({ error: "Invalid date of birth format" });
    }

    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }
    if (dobDate > today) {
        return res.status(400).json({ error: "Date of Birth cannot be in the future" });
    }
    if (age < 15) {
        return res.status(400).json({ error: "You must be at least 15 years old to register" });
    }

    // 5. Current Year
    const yearVal = parseInt(currentYear);
    if (isNaN(yearVal) || yearVal < 1 || yearVal > 4) {
        return res.status(400).json({ error: "Current year must be between 1 and 4" });
    }

    // 6. CGPA
    const cgpaVal = parseFloat(cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
        return res.status(400).json({ error: "CGPA must be a number between 0.00 and 10.00" });
    }

    // 7. Password Strength
    const passwordStr = String(password);
    if (passwordStr.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(passwordStr)) {
        return res.status(400).json({ error: "Password must include uppercase, lowercase, number, and special character" });
    }

    // 8. Confirm Password
    const confirmPasswordStr = String(confirmPassword);
    if (passwordStr !== confirmPasswordStr) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // check if email is already taken
        const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [emailStr]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordStr, salt);

        // start transaction since we are inserting into two tables
        await db.query('BEGIN');

        // insert user details first
        const userInsertQuery = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const userResult = await db.query(userInsertQuery, [nameStr, emailStr, hashedPassword, 'student']);
        const userId = userResult.rows[0].id; // get the new user id

        // insert profile details next using the userId and new frontend fields
        const profileInsertQuery = `
            INSERT INTO student_profiles (user_id, mobile, dob, department, course, current_year, cgpa)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await db.query(profileInsertQuery, [userId, mobileStr, formattedDob, department, course, yearVal, cgpaVal]);

        // commit if everything went fine
        await db.query('COMMIT');

        // generate a JWT token for the user so the frontend logs them in immediately
        const token = jwt.sign(
            { id: userId, email: emailStr, role: 'student' },
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            message: "Student registered successfully!",
            userId: userId,
            token: token
        });

    } catch (error) {
        // rollback if anything fails to prevent half-saved data
        await db.query('ROLLBACK');
        console.error('Error during student registration:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.login = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // Check if any required field is missing
    if (
        email === undefined || email === null || String(email).trim() === '' ||
        password === undefined || password === null || String(password).trim() === '' ||
        confirmPassword === undefined || confirmPassword === null || String(confirmPassword).trim() === ''
    ) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const emailStr = String(email).trim().toLowerCase();
    const passwordStr = String(password);
    const confirmPasswordStr = String(confirmPassword);

    // Verify confirmPassword matches password
    if (passwordStr !== confirmPasswordStr) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // Query user by email (case-insensitive)
        const userQuery = 'SELECT * FROM users WHERE LOWER(email) = $1';
        const userResult = await db.query(userQuery, [emailStr]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // Compare password hashes
        const isMatch = await bcrypt.compare(passwordStr, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token containing user id, email, and role
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error during user login:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

