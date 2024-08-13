const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.DB_CONNECT)
        .then(() => console.log('Connected to DB!'))
        .catch(err => console.error('Failed to connect to DB:', err));

    const PORT = process.env.PORT || 2000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
