const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/user', limiter);

app.use('/api/user', require('./routes/auth'));
app.use('/api/posts', require('./routes/post'));

app.get('/', (req, res) => {
    res.send({ message: 'Authentication API is running successfully!' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong on the server!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;