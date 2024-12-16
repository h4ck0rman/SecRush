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
                    type: String, 
                    ref: 'Puzzle', 
                    required: true 
                }, 
                // User's selected line
                selectedLine: { 
                    type: Number, 
                    required: true, 
                    min: 1
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

// TTL Index: Automatically delete documents after the `expireAt` date
GameSessionSchema.index({createdAt: 1},{expireAfterSeconds: 5});
GameSessionSchema.index({ sessionId: 1 });

module.exports = mongoose.model('GameSession', GameSessionSchema);
