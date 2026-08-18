const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      unique: true,
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate categoryId (e.g. CAT-0001) before save
categorySchema.pre('save', async function () {
  if (!this.categoryId) {
    const categories = await mongoose
      .model('Category')
      .find({}, { categoryId: 1 })
      .lean();

    let maxSeq = 0;
    categories.forEach((c) => {
      if (c.categoryId) {
        const match = c.categoryId.match(/^CAT-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.categoryId = `CAT-${String(maxSeq + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Category', categorySchema);
