const express = require('express');

const cors = require('cors');

require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

// mount auth routes
app.use('/api/auth', authRoutes);

// mount job routes
app.use('/api', jobRoutes);

// mount swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the college placement portal api" });
});

app.listen(PORT, () => {
    console.log(`server is running successfully on port ${PORT}`);
    console.log(`swagger documentation is available at http://localhost:${PORT}/api-docs`);
    console.log("🚀 Backend CI/CD Test - July 22");
});