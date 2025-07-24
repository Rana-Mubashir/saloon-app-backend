import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ "image.url": 1 });

export const Banner = mongoose.model("Banner", bannerSchema);
