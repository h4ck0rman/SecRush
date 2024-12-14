const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema(
    {
        // Unique session ID
        sessionId: { 
            type: String, 
            required: true, 
            unique: true 
        },
        // list of all the puzzles that have been attempted
        puzzles: [
            {   
                // Reference to the Puzzle
                puzzleId: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'Puzzle', 
                    required: true 
                }, 
                // User's selected line
                selectedLine: { 
                    type: Number, 
                    required: true 
                }, 
                // True if correct, false otherwise
                correct: { 
                    type: Boolean, 
                    required: true 
                }, 
            },
        ],
    },
    { 
        // Enables createdAt and updatedAt fields
        timestamps: true 
    } 
);

module.exports = mongoose.model('GameSession', GameSessionSchema);
