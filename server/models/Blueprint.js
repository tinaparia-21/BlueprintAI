const mongoose = require('mongoose');

const blueprintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a blueprint title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required for blueprint generation'],
    },
    generatedContent: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blueprint', blueprintSchema);
