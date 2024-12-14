const mongoose = require('mongoose');

const PuzzleSchema = new mongoose.Schema(
    {
        // The code snippet
        code: { 
            type: String, 
            required: true 
        }, 
        // 1-based index of the vulnerable line
        vulnerableLine: { 
            type: Number, 
            required: true 
        }, 
        // puzzle difficulty level 
        difficulty: { 
            type: String, 
            enum: ['easy', 'medium', 'hard'], 
            default: 'medium' 
        }, 
    },
    { 
        // Enable createdAt and updatedAt fields
        timestamps: true 
    } 
);

module.exports = mongoose.model('Puzzle', PuzzleSchema);
