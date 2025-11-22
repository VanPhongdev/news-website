require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const articleRoutes = require('./routes/article.routes');
const deletionRequestRoutes = require('./routes/deletionRequest.routes');
const commentRoutes = require('./routes/comment.routes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/articles/:articleId/comments', commentRoutes); // Nested route for article comments
app.use('/api/comments', commentRoutes); // Direct route for comment operations
app.use('/api/articles', articleRoutes);
app.use('/api/deletion-requests', deletionRequestRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'News Website API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            categories: '/api/categories',
            articles: '/api/articles',
            comments: '/api/comments',
            deletionRequests: '/api/deletion-requests'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
