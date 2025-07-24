import mongoose from "mongoose";
import { Course, Review } from "../models/courseModel.js";
import { User } from "../models/userModel.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { attachEnrollmentCounts, isValidCourseType } from "../utils/helpers.js";
import { Interest } from "../models/interestModel.js";
export const addCoursesLessons = async (req, res) => {
  let cloudinaryResults = [];
  let course = null;
  const { id } = req.params;

  try {
    const { name, description, price, language, interest } = req.body;
    const files = req.files;

    if (!id) {
      if (!name || !description || !price || !language) {
        return res.status(400).json({
          success: false,
          message:
            "Name, description, price, and language are required for new courses",
        });
      }
    }

    let courseThumbnail = { public_id: null, url: null };
    let intro = { public_id: null, url: null };
    if (!id && files?.thumbnail) {
      const thumbnailFile = files.thumbnail[0];
      if (thumbnailFile.mimetype.startsWith("image")) {
        const result = await uploadToCloudinary(thumbnailFile);
        if (!result.success)
          throw new Error("Failed to upload course thumbnail");

        courseThumbnail = {
          public_id: result.data.public_id,
          url: result.data.url,
        };
        cloudinaryResults.push({
          publicId: result.data.public_id,
          type: "image",
        });
      }
    }

    if (!id && files.intro) {
      const introFile = files.intro[0];
      if (introFile.mimetype.startsWith("video")) {
        const result = await uploadToCloudinary(introFile);
        if (!result.success) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload course thumbnail",
          });
        }
        intro = {
          public_id: result.data.public_id,
          url: result.data.url,
        };
        cloudinaryResults.push({
          publicId: result.data.public_id,
          type: "video",
        });
      }
    }

    if (id) {
      const { name, type, startDate, endDate, location, meetingUrl, meetingType, startTime } = req.body;
      course = await Course.findById(id);
      if (!course)
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      const lessons = [];

      const lessonData = {
        type,
        name,
        startDate,
        endDate,
        location,
      };
      lessons.push(lessonData);
      const lessonVideos = files?.video || [];
      const lessonThumbnails = files?.thumbnail || [];

      for (let i = 0; i < lessons.length; i++) {
        const { type, name, startDate, endDate, location } = lessonData;

        if (!isValidCourseType(type)) {
          throw new Error(`Invalid lesson type at index ${i}`);
        }

        let thumbnail = { public_id: null, url: null };
        let videoDetails = null;
        let physicalDetails = null;
        let onlineMeetingDetails = null

        const thumbFile = lessonThumbnails[i];
        if (thumbFile?.mimetype?.startsWith("image")) {
          const thumbResult = await uploadToCloudinary(thumbFile);
          if (!thumbResult.success)
            throw new Error(`Failed to upload thumbnail for lesson ${i}`);

          thumbnail = {
            public_id: thumbResult.data.public_id,
            url: thumbResult.data.url,
          };
          cloudinaryResults.push({
            publicId: thumbResult.data.public_id,
            type: "image",
          });
        }

        if (type === "video") {
          const videoFile = lessonVideos[i];
          if (!videoFile?.mimetype?.startsWith("video")) {
            throw new Error(`Video file required for video lesson ${i}`);
          }

          const videoResult = await uploadToCloudinary(videoFile);
          if (!videoResult.success)
            throw new Error(`Failed to upload video for lesson ${i}`);

          cloudinaryResults.push({
            publicId: videoResult.data.public_id,
            type: "video",
          });

          videoDetails = {
            name,
            url: videoResult.data.url,
            public_id: videoResult.data.public_id,
            duration: videoResult.data.duration,
            thumbnail,
          };
        }

        if (type === "physical") {
          if (!startDate || !endDate) {
            throw new Error(
              `Start/end dates required for physical lesson ${i}`
            );
          }

          physicalDetails = {
            name,
            location,
            startTime: new Date(startDate),
            endTime: new Date(endDate),
            duration: (new Date(endDate) - new Date(startDate)) / 60000,
            thumbnail,
          };
        }

        if (type === "online") {
          onlineMeetingDetails = {
            name,
            meetingType: meetingType,
            startTime: startTime,
            meetingUrl: meetingUrl
          }
        }

        course.lessons.push({
          type,
          ...(videoDetails && { videoDetails }),
          ...(physicalDetails && { physicalDetails }),
          ...(onlineMeetingDetails && { onlineMeetingDetails }),
        });
      }
    } else {
      course = new Course({
        name,
        description,
        price: parseFloat(price),
        language,
        interest,
        courseIntro: intro,
        thumbnail: courseThumbnail,
        lessons: [],
      });
    }

    await course.save();

    return res.status(201).json({
      success: true,
      message: id
        ? "Lessons added successfully"
        : "Course created with lessons",
      data: course,
    });
  } catch (error) {
    for (const { publicId, type } of cloudinaryResults) {
      await deleteFromCloudinary(
        publicId,
        type === "video" ? "video" : "image"
      );
    }

    if (!id && course?._id) {
      await Course.deleteOne({ _id: course._id });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (course.thumbnail && course.thumbnail.public_id) {
      await deleteFromCloudinary(course.thumbnail.public_id, "image");
    }
    if (course.courseIntro && course.courseIntro.public_id) {
      await deleteFromCloudinary(course.courseIntro.public_id, "video");
    }

    for (const lesson of course.lessons) {
      if (lesson.videoDetails) {
        if (lesson.videoDetails.public_id) {
          await deleteFromCloudinary(lesson.videoDetails.public_id, "video");
        }
        if (
          lesson.videoDetails.thumbnail &&
          lesson.videoDetails.thumbnail.public_id
        ) {
          await deleteFromCloudinary(
            lesson.videoDetails.thumbnail.public_id,
            "image"
          );
        }
      }
      if (
        lesson.physicalDetails &&
        lesson.physicalDetails.thumbnail &&
        lesson.physicalDetails.thumbnail.public_id
      ) {
        await deleteFromCloudinary(
          lesson.physicalDetails.thumbnail.public_id,
          "image"
        );
      }
    }

    await Course.deleteOne({ _id: id });

    return res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const course = await Course.findById(id);

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const lessonIndex = course.lessons.findIndex(
      (lesson) => lesson._id.toString() === lessonId
    );
    if (lessonIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });

    const lesson = course.lessons[lessonIndex];

    // Delete associated Cloudinary assets for video/physical lesson if they exist
    if (lesson.videoDetails) {
      if (lesson.videoDetails.public_id) {
        await deleteFromCloudinary(lesson.videoDetails.public_id, "video");
      }
      if (
        lesson.videoDetails.thumbnail &&
        lesson.videoDetails.thumbnail.public_id
      ) {
        await deleteFromCloudinary(
          lesson.videoDetails.thumbnail.public_id,
          "image"
        );
      }
    }
    if (
      lesson.physicalDetails &&
      lesson.physicalDetails.thumbnail &&
      lesson.physicalDetails.thumbnail.public_id
    ) {
      await deleteFromCloudinary(
        lesson.physicalDetails.thumbnail.public_id,
        "image"
      );
    }

    // Remove the lesson from the lessons array
    course.lessons.splice(lessonIndex, 1);
    await course.save();

    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  let cloudinaryResults = [];
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const { name, description, price, language, interest } = req.body;
    if (name) course.name = name;
    if (description) course.description = description;
    if (price) course.price = parseFloat(price);
    if (language) course.language = language;
    if (interest) course.interest = interest;

    const files = req.files;

    if (files?.thumbnail) {
      if (course.thumbnail && course.thumbnail.public_id) {
        await deleteFromCloudinary(course.thumbnail.public_id, "image");
      }
      const thumbnailFile = files.thumbnail[0];
      if (thumbnailFile.mimetype.startsWith("image")) {
        const result = await uploadToCloudinary(thumbnailFile);
        if (!result.success)
          throw new Error("Failed to upload course thumbnail");
        course.thumbnail = {
          public_id: result.data.public_id,
          url: result.data.url,
        };
        cloudinaryResults.push({
          publicId: result.data.public_id,
          type: "image",
        });
      }
    }

    if (files?.intro) {
      if (course.courseIntro && course.courseIntro.public_id) {
        await deleteFromCloudinary(course.courseIntro.public_id, "video");
      }
      const introFile = files.intro[0];
      if (introFile.mimetype.startsWith("video")) {
        const result = await uploadToCloudinary(introFile);
        if (!result.success)
          throw new Error("Failed to upload course intro video");
        course.courseIntro = {
          public_id: result.data.public_id,
          url: result.data.url,
        };
        cloudinaryResults.push({
          publicId: result.data.public_id,
          type: "video",
        });
      }
    }

    await course.save();
    res.json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    for (const { publicId, type } of cloudinaryResults) {
      await deleteFromCloudinary(
        publicId,
        type === "video" ? "video" : "image"
      );
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLesson = async (req, res) => {
  let cloudinaryResults = [];
  try {
    const { id, lessonId } = req.params;
    const course = await Course.findById(id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const lessonIndex = course.lessons.findIndex(
      (lesson) => lesson._id.toString() === lessonId
    );
    if (lessonIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });

    let lesson = course.lessons[lessonIndex];
    const { type, name, startDate, endDate, location } = req.body;

    if (type) {
      if (!isValidCourseType(type)) {
        throw new Error("Invalid lesson type provided");
      }
      lesson.type = type;
    }
    if (name) lesson.name = name;

    const files = req.files;

    if (lesson.type === "video") {
      if (files?.video) {
        if (lesson.videoDetails && lesson.videoDetails.public_id) {
          await deleteFromCloudinary(lesson.videoDetails.public_id, "video");
        }
        const videoFile = files.video[0];
        if (!videoFile.mimetype.startsWith("video")) {
          throw new Error("Invalid video file");
        }
        const videoResult = await uploadToCloudinary(videoFile);
        if (!videoResult.success) throw new Error("Failed to upload video");
        cloudinaryResults.push({
          publicId: videoResult.data.public_id,
          type: "video",
        });

        let thumbnail = lesson.videoDetails?.thumbnail || {
          public_id: null,
          url: null,
        };
        if (files?.thumbnail) {
          if (thumbnail && thumbnail.public_id) {
            await deleteFromCloudinary(thumbnail.public_id, "image");
          }
          const thumbFile = files.thumbnail[0];
          if (thumbFile.mimetype.startsWith("image")) {
            const thumbResult = await uploadToCloudinary(thumbFile);
            if (!thumbResult.success)
              throw new Error("Failed to upload thumbnail");
            thumbnail = {
              public_id: thumbResult.data.public_id,
              url: thumbResult.data.url,
            };
            cloudinaryResults.push({
              publicId: thumbResult.data.public_id,
              type: "image",
            });
          }
        }
        lesson.videoDetails = {
          name: name || lesson.name,
          url: videoResult.data.url,
          public_id: videoResult.data.public_id,
          duration: videoResult.data.duration,
          thumbnail,
        };
      }
    } else if (lesson.type === "physical") {
      if (startDate) lesson.startDate = new Date(startDate);
      if (endDate) lesson.endDate = new Date(endDate);
      if (location) lesson.location = location;
      if (files?.thumbnail) {
        let thumbnail = lesson.physicalDetails?.thumbnail || {
          public_id: null,
          url: null,
        };
        if (thumbnail && thumbnail.public_id) {
          await deleteFromCloudinary(thumbnail.public_id, "image");
        }
        const thumbFile = files.thumbnail[0];
        if (thumbFile.mimetype.startsWith("image")) {
          const thumbResult = await uploadToCloudinary(thumbFile);
          if (!thumbResult.success)
            throw new Error("Failed to upload thumbnail");
          thumbnail = {
            public_id: thumbResult.data.public_id,
            url: thumbResult.data.url,
          };
          cloudinaryResults.push({
            publicId: thumbResult.data.public_id,
            type: "image",
          });
        }
        lesson.physicalDetails = {
          name: name || lesson.name,
          location:
            location ||
            (lesson.physicalDetails && lesson.physicalDetails.location),
          startTime: startDate
            ? new Date(startDate)
            : lesson.physicalDetails && lesson.physicalDetails.startTime,
          endTime: endDate
            ? new Date(endDate)
            : lesson.physicalDetails && lesson.physicalDetails.endTime,
          duration:
            startDate && endDate
              ? (new Date(endDate) - new Date(startDate)) / 60000
              : lesson.physicalDetails && lesson.physicalDetails.duration,
          thumbnail,
        };
      }
    }
    else if (lesson.type === "online") {
      lesson.onlineMeetingDetails = {
        name: lesson.name,
        meetingType: lesson?.onlineMeetingDetails?.meetingType,
        startTime: lesson?.onlineMeetingDetails?.startTime,
        meetingUrl: lesson?.onlineMeetingDetails?.meetingUrl
      }
    }

    await course.save();
    res.json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    for (const { publicId, type } of cloudinaryResults) {
      await deleteFromCloudinary(
        publicId,
        type === "video" ? "video" : "image"
      );
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getCoursesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;
    const { search, interest } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (interest) {
      const interests = await Interest.find(
        { name: { $regex: interest, $options: "i" } },
        "_id"
      );
      if (interests.length > 0) {
        const interestIds = interests.map((i) => i._id);
        query.interest = { $in: interestIds };
      } else {
        return res.json({
          data: [],
          pagination: {
            current_page: page,
            per_page: limit,
            total_items: 0,
            total_pages: 0,
            has_next_page: false,
            has_prev_page: false,
          },
        });
      }
    }

    let courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .populate("interest")
      .lean();

    courses = await attachEnrollmentCounts(courses);

    if (req.user?._id) {
      const userFavorites = new Set(
        req.user.favoriteCourses.map((courseId) => courseId.toString())
      );
      courses = courses.map((course) => ({
        ...course,
        favourite: userFavorites.has(course._id.toString()),
      }));
    }

    const totalCourses = await Course.countDocuments(query);
    const totalPages = Math.ceil(totalCourses / limit);

    res.json({
      data: courses,
      pagination: {
        current_page: page,
        per_page: limit,
        total_items: totalCourses,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLessonProgress = async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    const enrollment = user.coursesEnrolled.id(enrollmentId);
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, error: "Enrollment not found" });
    if (!enrollment.lessonsProgress) {
      enrollment.lessonsProgress = [];
    }
    const lessonProgress = enrollment.lessonsProgress.find(
      (lp) => lp.lesson.toString() === lessonId
    );
    if (lessonProgress) {
      lessonProgress.isCompleted = true;
    } else {
      enrollment.lessonsProgress.push({ lesson: lessonId, isCompleted: true });
    }
    const course = await Course.findById(enrollment.course);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment.lessonsProgress.filter(
      (lp) => lp.isCompleted
    ).length;
    const progress = Math.round((completedLessons / totalLessons) * 100);
    enrollment.progress = progress;
    if (progress === 100) {
      enrollment.isCompleted = true;
      user.completedCourses = user.completedCourses || [];
      if (!user.completedCourses.includes(enrollment.course)) {
        user.completedCourses.push(enrollment.course);
      }
      user.coursesEnrolled.id(enrollmentId).remove();
    }
    await user.save();
    return res.status(200).json({
      message: "Lesson progress updated",
      progress,
      isCompleted: enrollment.isCompleted || progress === 100,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update lesson progress.",
      error: error.message,
    });
  }
};

export const getLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page.toString(), 10);
    const pageSize = parseInt(limit.toString(), 10);

    if (pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const skip = (pageNumber - 1) * pageSize;
    const lessons = course.lessons.slice(skip, skip + pageSize);
    const totalLessons = course.lessons.length;
    const totalPages = Math.ceil(totalLessons / pageSize);

    return res.status(200).json({
      success: true,
      message: "Lessons retrieved successfully.",
      data: {
        lessons,
        meta: {
          page: pageNumber,
          limit: pageSize,
          totalLessons,
          totalPages,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lessons.",
      error: error.message,
    });
  }
};
export const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    let courses = await Course.find()
      .skip(skip)
      .limit(pageSize)
      .populate("interest")
      .lean();

    courses = await attachEnrollmentCounts(courses);
    courses = courses.map((course) => {
      if (course.reviews && course.reviews.length) {
        course.reviews = course.reviews.filter((review) => review.approved);
      }
      return course;
    });
    if (req.user?._id.toString()) {
      const userFavorites = new Set(
        req.user?.favoriteCourses.map((courseId) => courseId.toString())
      );
      courses = courses.map((course) => ({
        ...course,
        favourite: userFavorites.has(course._id.toString()),
      }));
    }

    const totalCourses = await Course.countDocuments();

    res.json({
      success: true,
      data: courses,
      pagination: {
        total: totalCourses,
        page,
        pageSize,
        totalPages: Math.ceil(totalCourses / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPopularCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    let courses = await Course.find()
      .sort({ views: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("interest")
      .lean();
    courses = await attachEnrollmentCounts(courses);
    courses = courses.map((course) => {
      if (course.reviews && course.reviews.length) {
        course.reviews = course.reviews.filter((review) => review.approved);
      }
      return course;
    });
    if (req.user?._id.toString()) {
      const userFavorites = new Set(
        req.user?.favoriteCourses.map((courseId) => courseId.toString())
      );
      courses = courses.map((course) => ({
        ...course,
        favourite: userFavorites.has(course._id.toString()),
      }));
    }
    const totalCourses = await Course.countDocuments();

    res.json({
      success: true,
      data: courses,
      pagination: {
        total: totalCourses,
        page,
        pageSize,
        totalPages: Math.ceil(totalCourses / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getLatestCourse = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    let courses = await Course.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("interest")
      .lean();

    courses = await attachEnrollmentCounts(courses);
    courses = courses.map((course) => {
      if (course.reviews && course.reviews.length) {
        course.reviews = course.reviews.filter((review) => review.approved);
      }
      return course;
    });
    if (req.user?._id.toString()) {
      const userFavorites = new Set(
        req.user?.favoriteCourses.map((courseId) => courseId.toString())
      );
      courses = courses.map((course) => ({
        ...course,
        favourite: userFavorites.has(course._id.toString()),
      }));
    }

    const totalCourses = await Course.countDocuments();

    res.json({
      success: true,
      data: courses,
      pagination: {
        total: totalCourses,
        page,
        pageSize,
        totalPages: Math.ceil(totalCourses / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const filterCourses = async (req, res) => {
  try {
    const { interest, language, price } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const filter = {};

    if (interest) filter.interest = interest;
    if (language) filter.language = language;
    if (price) {
      filter.price = {};
      if (price) filter.price.$lte = parseFloat(price);
    }

    const courses = await Course.find(filter)
      .skip(skip)
      .limit(pageSize)
      .populate("interest")
      .lean();

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchCourses = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const courses = await Course.find({
      $or: [{ name: { $regex: q, $options: "i" } }],
    })
      .skip(skip)
      .limit(pageSize)
      .populate("interest")
      .lean();

    const total = await Course.countDocuments({
      $or: [{ name: { $regex: q, $options: "i" } }],
    });

    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getCoursesById = async (req, res) => {
  try {
    const courseId = req.params.id;
    let course;

    if (req.user) {
      const userId = req.user._id;

      course = await Course.findByIdAndUpdate(
        courseId,
        [
          {
            $set: {
              viewedBy: {
                $cond: {
                  if: {
                    $in: [userId, { $ifNull: ["$viewedBy", []] }],
                  },
                  then: "$viewedBy",
                  else: {
                    $concatArrays: [{ $ifNull: ["$viewedBy", []] }, [userId]],
                  },
                },
              },
              views: {
                $cond: {
                  if: {
                    $in: [userId, { $ifNull: ["$viewedBy", []] }],
                  },
                  then: "$views",
                  else: { $add: ["$views", 1] },
                },
              },
            },
          },
        ],
        { new: true }
      )
        .populate("interest")
        .populate("reviews.user")
        .lean();
    } else {
      course = await Course.findById(courseId)
        .populate("interest")
        .populate("reviews.user")
        .lean();
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLesssonById = async (req, res) => {
  try {
    const { id, lessonId } = req.params;

    const course = await Course.findById(id).populate("lessons.likes");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const lesson = course.lessons.find((l) => l._id.toString() === lessonId);

    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const favouriteCourses = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Course ID" });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const favIndex = user.favoriteCourses.findIndex(
      (favCourseId) => favCourseId.toString() === id
    );

    if (favIndex !== -1) {
      user.favoriteCourses.splice(favIndex, 1);
      const userIndex = course.favouriteBy.findIndex(
        (favUserId) => favUserId.toString() === user?._id.toString()
      );
      if (userIndex !== -1) {
        course.favouriteBy.splice(userIndex, 1);
      }
      await user.save();
      await course.save();
      return res.status(200).json({
        success: true,
        message: "Course removed from favorites",
      });
    } else {
      user.favoriteCourses.push(id);
      if (
        !course.favouriteBy.some(
          (favUserId) => favUserId.toString() === user?._id.toString()
        )
      ) {
        course.favouriteBy.push(user?._id);
      }
      await user.save();
      await course.save();
      return res.status(200).json({
        success: true,
        message: "Course added to favorites",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getFavouriteCourses = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page.toString(), 10);
    const pageSize = parseInt(limit.toString(), 10);

    if (pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const skip = (pageNumber - 1) * pageSize;

    const courses = await Course.find({ _id: { $in: user.favoriteCourses } })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const userFavorites = new Set(
      user.favoriteCourses.map((courseId) => courseId.toString())
    );
    const coursesWithFavouriteStatus = courses.map((course) => ({
      ...course,
      favourite: userFavorites.has(course._id.toString()),
    }));
    const totalCourses = await Course.countDocuments({
      _id: { $in: user.favoriteCourses },
    });
    const totalPages = Math.ceil(totalCourses / pageSize);

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: {
        courses: coursesWithFavouriteStatus,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          totalCourses,
          totalPages,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const enRollCourse = async (req, res) => {
  let cloudinaryResult;

  try {
    const { id } = req.params;
    const { is_sign } = req.body;
    const isSign = is_sign === "true";

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyEnrolled = user.coursesEnrolled.some((enrollment) => {
      if (enrollment && enrollment.course) {
        return enrollment.course.toString() === id;
      }
      return enrollment.toString() === id;
    });
    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    const file = req.file;
    let contractData = {};
    if (file) {
      cloudinaryResult = await uploadToCloudinary(file);
      contractData = {
        public_id: cloudinaryResult.data?.public_id,
        url: cloudinaryResult.data?.url,
      };
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    user.coursesEnrolled.push({
      course: id,
      contract_image: contractData,
      is_sign_contract: isSign,
    });

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Enrolled successfully",
      course: {
        id: course._id,
        name: course.name,
        courses: user.coursesEnrolled,
      },
    });
  } catch (error) {
    if (
      cloudinaryResult &&
      cloudinaryResult.data &&
      cloudinaryResult.data.public_id
    ) {
      await deleteFromCloudinary(cloudinaryResult.data.public_id);
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id)
      .populate({
        path: "coursesEnrolled.course",
        populate: {
          path: "lessons",
        },
      })
      .populate({
        path: "coursesEnrolled.lessonsProgress.lesson",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page.toString(), 10);
    const pageSize = parseInt(limit.toString(), 10);

    if (pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const startIndex = (pageNumber - 1) * pageSize;
    const enrollments = user.coursesEnrolled;
    const totalCourses = enrollments.length;
    const totalPages = Math.ceil(totalCourses / pageSize);

    const paginatedEnrollments = enrollments.slice(
      startIndex,
      startIndex + pageSize
    );

    const courses = paginatedEnrollments.map((enrollment) => ({
      course: enrollment.course,
      contract_image: enrollment.contract_image,
      is_sign_contract: enrollment.is_sign_contract,
      lessonsProgress: enrollment.lessonsProgress.map((lessonProgress) => ({
        lesson: lessonProgress.lesson,
        isCompleted: lessonProgress.isCompleted,
      })),
      isCompleted: enrollment.isCompleted,
      progress: enrollment.progress,
    }));

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: {
        courses,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          totalCourses,
          totalPages,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEnrolledCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user?._id)
      .populate({
        path: "coursesEnrolled.course",
        populate: {
          path: "lessons",
        },
      })
      .populate({
        path: "coursesEnrolled.lessonsProgress.lesson",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const enrollment = user.coursesEnrolled.find(
      (enrollment) =>
        enrollment.course && enrollment.course._id.toString() === id.toString()
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrolled course not found",
      });
    }

    const enrolledCourse = {
      course: enrollment.course,
      contract_image: enrollment.contract_image,
      is_sign_contract: enrollment.is_sign_contract,
      lessonsProgress: enrollment.lessonsProgress.map((lessonProgress) => ({
        lesson: lessonProgress.lesson,
        isCompleted: lessonProgress.isCompleted,
      })),
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
    };

    return res.status(200).json({
      success: true,
      message: "Enrolled course retrieved successfully",
      data: enrolledCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const getEnrolledCourses = async (req, res) => {
//   try {
//     const user = await User.findById(req.user?._id).populate(
//       "coursesEnrolled.course"
//     );
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     const { page = 1, limit = 10 } = req.query;

//     const pageNumber = parseInt(page.toString(), 10);
//     const pageSize = parseInt(limit.toString(), 10);

//     if (pageNumber < 1 || pageSize < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid pagination parameters.",
//       });
//     }

//     const startIndex = (pageNumber - 1) * pageSize;
//     const enrollments = user.coursesEnrolled;
//     const totalCourses = enrollments.length;
//     const totalPages = Math.ceil(totalCourses / pageSize);

//     const paginatedEnrollments = enrollments.slice(
//       startIndex,
//       startIndex + pageSize
//     );

//     const courses = paginatedEnrollments.map((enrollment) => ({
//       course: enrollment,
//       contract_image: enrollment.contract_image,
//       is_sign_contract: enrollment.is_sign_contract,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Courses retrieved successfully",
//       data: {
//         courses,
//         pagination: {
//           page: pageNumber,
//           limit: pageSize,
//           totalCourses,
//           totalPages,
//         },
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const unEnrollCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const enrollmentIndex = user.coursesEnrolled.findIndex(
      (enrollment) => enrollment.course.toString() === id
    );
    if (enrollmentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Not enrolled in this course",
      });
    }

    const enrollment = user.coursesEnrolled[enrollmentIndex];
    if (enrollment.contract_image?.public_id) {
      await deleteFromCloudinary(enrollment.contract_image.public_id);
    }

    user.coursesEnrolled.splice(enrollmentIndex, 1);
    await user.save();

    const course = await Course.findById(id);

    return res.status(200).json({
      success: true,
      message: "Unenrolled successfully",
      course: {
        id: course._id,
        name: course.name,
        type: course.type,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitReview = async (req, res) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    if (!user.completedCourses || !user.completedCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ success: false, error: "Course not completed yet" });
    }
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    course.reviews.push({
      user: req.user._id,
      rating,
      comment,
      approved: false,
    });
    await course.save();
    res.status(200).json({
      success: false,
      message: "Review submitted. Awaiting admin approval.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send review.",
      error: error.message,
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate({
      path: "user",
      select: "name email profile_picture.url",
    });
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message,
    });
  }
};

export const updateReviewStatus = async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;

  try {
    const review = await Review.findByIdAndUpdate(
      id,
      { approved },
      { new: true }
    );

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    return res.status(200).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update review status.",
      error: error.message,
    });
  }
};

export const getAllOnlineLessons = async (req, res) => {
  try {
    // const currentDate = new Date(); 

    const resp = await Course.aggregate([
      {
        $project: {
          _id: 0,
          courseName: "$name", 
          lessons: {
            $filter: {
              input: "$lessons",
              as: "lesson",
              cond: {
                $and: [
                  { $eq: ["$$lesson.type", "online"] },
                  { $eq: ["$$lesson.onlineMeetingDetails.meetingType", "schedule"] }
                ]
              }
            }
          }
        }
      },
      { $unwind: "$lessons" },
      {
        $addFields: {
          "lessons.courseName": "$courseName"
        }
      },
      {
        $replaceRoot: { newRoot: "$lessons" }
      },
      // {
      //   $match: {
      //     "onlineMeetingDetails.startTime": { $gte: currentDate } 
      //   }
      // },
      {
        $sort: {
          "onlineMeetingDetails.startTime": 1
        }
      }
    ]);

    if (resp.length === 0) {
      return res.status(200).json({
        message: "No scheduled meeting found!",
        data: resp
      });
    }

    return res.status(200).json({
      message: "Scheduled meetings found!",
      data: resp
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get meetings.",
      error: error.message,
    });
  }
};
