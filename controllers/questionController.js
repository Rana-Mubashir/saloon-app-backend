import mongoose from "mongoose";
import { Question } from "../models/questionModel.js";

export const createQuestion = async (req, res) => {
  const { question } = req.body;
  try {
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    let data;
    if (req.user?._id) {
      data = new Question({
        question,
        user: req.user?._id,
      });
    } else {
      data = new Question({
        question,
        admin: req.admin?._id,
      });
    }

    const questionData = await data.save();

    let populatedData;
    if (!req.user?._id) {
      populatedData = await Question.findById(questionData._id)
        .populate("admin", "name email")
        .populate("answers.admin", "name email");
    } else {
      populatedData = await Question.findById(questionData._id)
        .populate("user", "name email profile_picture")
        .populate("answers.user", "name email profile_picture");
    }

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: populatedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const updateQuestionAndAnswer = async (req, res) => {
  const { id, answerId } = req.params;
  const { question, answer } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    (answerId && !mongoose.Types.ObjectId.isValid(answerId))
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid question or answer ID",
    });
  }

  try {
    const questionDoc = await Question.findById(id);
    if (!questionDoc) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (req.admin._id) {
      if (question) {
        questionDoc.question = question;
      }

      if (answerId && answer) {
        const answerDoc = questionDoc.answers.id(answerId);
        if (!answerDoc) {
          return res.status(404).json({
            success: false,
            message: "Answer not found",
          });
        }
        answerDoc.answer = answer;
      }

      await questionDoc.save();

      return res.status(200).json({
        success: true,
        message: "Question and/or answer updated successfully",
        data: questionDoc,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this question or answer",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const addAnswer = async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  try {
    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const isUser = req.user?._id ? true : false;
    const authId = isUser ? req.user._id : req.admin._id;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (isUser) {
      question.answers.push({
        content: answer,
        user: authId,
      });
    } else {
      question.answers.push({
        content: answer,
        admin: authId,
      });
    }

    await question.save();

    const populatedQuestion = await Question.findById(id)
      .populate("user", "name email profile_picture")
      .populate("admin", "name email")
      .populate("answers.user", "name email profile_picture")
      .populate("answers.admin", "name email");

    return res.status(201).json({
      success: true,
      message: "Answer added successfully",
      data: populatedQuestion,
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const questions = await Question.find({ user: { $exists: true } })
      .populate("user", "name email profile_picture")
      .populate("answers.user", "name email profile_picture")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments();
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      data: {
        questions,
        meta: {
          currentPage: parseInt(page),
          totalPages,
          totalQuestions: total,
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

export const getFAQs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const questions = await Question.find({ admin: { $exists: true } })
      .populate("admin", "name email")
      .populate("answers.admin", "name email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments();
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      data: {
        questions,
        meta: {
          currentPage: parseInt(page),
          totalPages,
          totalQuestions: total,
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

export const getQuestionsByAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const searchQuery = search
      ? { question: { $regex: search, $options: "i" }, admin: req.admin._id }
      : { admin: req.admin._id };

    const questions = await Question.find(searchQuery)
      .populate("admin", "name email")
      .populate("answers.admin", "name email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        current_page: page,
        per_page: limit,
        total_items: total,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid question ID",
    });
  }

  try {
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const isUser = req.user?._id ? true : false;
    const authId = isUser ? req.user._id : req.admin._id;

    if (isUser) {
      if (!question.user || question.user.toString() !== authId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this question",
        });
      }
    } else {
      if (!question.admin || question.admin.toString() !== authId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this question",
        });
      }
    }

    await question.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteAnswer = async (req, res) => {
  const { id, answerId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(answerId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid question or answer ID",
    });
  }

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    const isUser = req.user?._id ? true : false;
    const authId = isUser ? req.user._id : req.admin._id;

    if (isUser) {
      if (!answer.user || answer.user.toString() !== authId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this answer",
        });
      }
    } else {
      if (!answer.admin || answer.admin.toString() !== authId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this answer",
        });
      }
    }

    answer.deleteOne();

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
