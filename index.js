const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

if (!process.env.TOKEN_SECRET || !process.env.DB_CONNECT) {
    console.error('FATAL ERROR: TOKEN_SECRET and DB_CONNECT must be defined in your .env file');
    process.exit(1);
}

const app = require('./app');

mongoose.connect(process.env.DB_CONNECT)
    .then(() => console.log('Connected to DB!'))
    .catch((err) => console.error('Database connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Up and running on port ${PORT}`));