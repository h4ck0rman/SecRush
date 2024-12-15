const GameSession = require('../models/GameSession');
const { validate: isUUID } = require('uuid');

const fetchGameSession = async (req, res, next) => {
    const sessionId = req.cookies.sessionId;

    if (!sessionId || !isUUID(sessionId)) {
        return res.status(400).json({ error: 'No active game. Please start a new Game.' });
    }

    try {
        const session = await GameSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ error: 'Game session not found' });
        }

        req.session = session; // Attach the session to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(500).json({ error: 'Error fetching game session' });
    }
};

module.exports = fetchGameSession;
