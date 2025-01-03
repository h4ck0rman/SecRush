const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');

const PuzzleSchema = new mongoose.Schema(
    {
        // Unique session ID
        _id: { 
            type: String, 
            default: uuid
        },
        // The code snippet
        code: { 
            type: String, 
            required: true 
        }, 
        language: { 
            type: String, 
            required: true 
        }, 

        // 1-based index of the vulnerable line
        vulnerableLine: { 
            type: Number, 
            min: 1,
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
