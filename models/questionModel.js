import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Answer is required"],
    validate: {
      validator: function (v) {
        return typeof v === "string" && v.trim().length > 0;
      },
      message: "Answer must be a valid string",
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  question: {
    type: String,
    required: [true, "Question is required"],
    validate: {
      validator: function (v) {
        return typeof v === "string" && v.trim().length > 0;
      },
      message: "Question must be a valid string",
    },
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: false,
  },
  answers: [answerSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

questionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Question = mongoose.model("Question", questionSchema);
