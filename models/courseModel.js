import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LessonSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["physical", "video", "online"],
    },
    physicalDetails: {
      name: String,
      location: String,
      duration: Number,
      thumbnail: {
        public_id: String,
        url: String,
      },
      startTime: Date,
      endTime: Date,
    },
    videoDetails: {
      name: String,
      url: String,
      public_id: String,
      duration: Number,
      thumbnail: {
        public_id: String,
        url: String,
      },
    },
    onlineMeetingDetails: {
      name:String,
      meetingType:String,
      startTime: Date,
      meetingUrl:String
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favourite: { type: Boolean, default: false },
    favouriteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    price: { type: Number, required: true, min: 0 },
    interest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["English", "French", "Other"],
      default: "English",
    },
    thumbnail: {
      public_id: String,
      url: String,
    },
    courseIntro: {
      public_id: String,
      url: String,
    },
    reviews: [ReviewSchema],
    lessons: [LessonSchema],
  },
  { timestamps: true }
);
export const Review = mongoose.model("Review", ReviewSchema);
export const Lesson = mongoose.model("Lesson", LessonSchema);
export const Course = mongoose.model("Course", CourseSchema);
