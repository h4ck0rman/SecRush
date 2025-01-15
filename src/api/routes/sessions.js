const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');
const Puzzle = require('../models/Puzzle');
const fetchGameSession = require('../middleware/fetchGameSession');
const { v4: uuidv4 } = require('uuid');
const { validate: isUUID } = require('uuid');
const { strict } = require('assert');

// Get session details (sessionId fetched from cookie)
router.get('/', fetchGameSession, async (req, res) => {
    const session = req.session; 
    res.json(session);
});

// Start a new game session and set sessionId in a cookie
router.post('/newSession', async (req, res) => {
    try {
        const sessionId = uuidv4(); 
        const session = new GameSession({ sessionId, puzzles: [] });
        await session.save();

        // Set the sessionId in a cookie
        res.cookie('sessionId', sessionId, {
            httpOnly: true, // Prevent client-side JavaScript access
            maxAge: 60 * 60 * 1000, // Cookie expires in 1 day
            secure: true,
            sameSite: 'strict',
        });

        res.status(201).json({ message: 'Game session started', sessionId });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Error starting game session' });
    }
});

// Get a new puzzle for the session (sessionId fetched from cookie)
router.get('/newPuzzle', fetchGameSession, async (req, res) => {
    const session = req.session; 

    try {
        const attemptedPuzzles = session.puzzles.map(p => p.puzzleId);

        // Find a random puzzle that has not been attempted
        const newPuzzle = await Puzzle.aggregate([
            { $match: { _id: { $nin: attemptedPuzzles } } }, // Exclude already attempted puzzles
            { $sample: { size: 1 } }, // Randomly select one puzzle
        ]);

        if (!newPuzzle.length) {
            return res.status(404).json({ error: 'No more puzzles available for this session' });
        }

        const { _id, code, difficulty, language } = newPuzzle[0];
        return res.json({id: _id, code, difficulty, language});


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Error fetching new puzzle' });
    }
});

// Get a new puzzle for the session (sessionId fetched from cookie)
router.get('/getPuzzle/:puzzleId', fetchGameSession, async (req, res) => {
    
    const { puzzleId } = req.params;

    if (!puzzleId || !isUUID(puzzleId)) {
        return res.status(400).json({ error: 'Invalid Puzzle Reference!' });
    }

    try {
        // Fetch the puzzle to verify the solution
        const puzzle = await Puzzle.findOne({ _id: { $eq: puzzleId } });
        if (!puzzle) {
            return res.status(404).json({ error: 'Puzzle not found' });
        }

        const { _id, code, difficulty, language, vulnerableLine } = puzzle;
        return res.json({id: _id, code, difficulty, language, vulnerableLine});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Error fetching new puzzle' });
    }
});

// Submit a puzzle result (sessionId fetched from cookie)
router.post('/solvePuzzle', fetchGameSession, async (req, res) => {

    const session = req.session; 
    const { puzzleId, selectedLine } = req.body;

    if (!puzzleId || !isUUID(puzzleId)) {
        return res.status(400).json({ error: 'Invalid Puzzle Reference!' });
    }

    if (selectedLine === undefined ) {
        return res.status(400).json({ error: 'line number are required' });
    }

    try {
        // Check if the puzzle has already been solved
        const existingPuzzle = session.puzzles.find(p => p.puzzleId === puzzleId);
        if (existingPuzzle) {
            return res.status(400).json({ error: 'This puzzle has already been attempted in this session.' });
        }

        // Fetch the puzzle to verify the solution
        const puzzle = await Puzzle.findOne({ _id: { $eq: puzzleId } });
        if (!puzzle) {
            return res.status(404).json({ error: 'Puzzle not found' });
        }

        // Check if the selected line matches the vulnerable line
        const correct = puzzle.vulnerableLine === selectedLine;

        // Update the session with the result
        session.puzzles.push({ puzzleId, selectedLine, correct });
        await session.save();

        res.json({ message: 'Puzzle result recorded successfully', puzzleId, correct, correctLine: puzzle.vulnerableLine });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({ error: 'Error recording puzzle result' });
    }
});



module.exports = router;
