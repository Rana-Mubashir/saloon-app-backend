import mongoose, { Schema } from "mongoose";

const InterestSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

InterestSchema.index({ name: 1, createdAt: -1 });

export const Interest = mongoose.model("Interest", InterestSchema);
