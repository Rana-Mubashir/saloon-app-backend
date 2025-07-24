import mongoose, { Schema } from "mongoose";

const BlacklistSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
BlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Blacklist = mongoose.model("Blacklist", BlacklistSchema);

export default Blacklist;
