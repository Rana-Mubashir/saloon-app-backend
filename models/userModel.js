import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

export const SkillLevel = {
  Beginner: "beginner",
  Intermediate: "intermediate",
  Advanced: "advanced",
};

const EnrollmentSchema = new Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    contract_image: {
      public_id: { type: String },
      url: { type: String },
    },
    is_sign_contract: { type: Boolean, default: false },
    lessonsProgress: [
      {
        lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    progress: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    profile_picture: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    skillLevel: {
      type: String,
      enum: Object.values(SkillLevel),
      required: false,
    },
    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interest",
      },
    ],
    coursesEnrolled: [EnrollmentSchema],
    favoriteCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    otp: {
      type: Number,
      required: false,
    },
    otpExpiry: {
      type: Date,
      required: false,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    resetPasswordRequest: {
      type: Boolean,
      default: false,
    },
    otpCount: {
      type: Number,
      default: 0,
    },
    otpRestrictionExpiry: {
      type: Date,
      index: {
        expires: "2h",
        partialFilterExpression: {
          otpRestrictionExpiry: { $exists: true },
        },
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index(
  {
    email: 1,
    phone: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      $and: [
        { isDeleted: false },
        {
          $or: [
            { email: { $exists: true, $ne: null } },
            { phone: { $exists: true, $ne: null } },
          ],
        },
      ],
    },
    sparse: true,
  }
);
UserSchema.pre("save", function (next) {
  if (this.isModified("otpRestrictionExpiry") && !this.otpRestrictionExpiry) {
    this.otpCount = 0;
  }
  next();
});
UserSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});
export const User = mongoose.model("User", UserSchema);
