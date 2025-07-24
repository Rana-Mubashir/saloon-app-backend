/**
 * @swagger
 * /question/create:
 *   post:
 *     summary: Create a new question
 *     description: Allows authenticated users to submit a question.
 *     tags:
 *       - User - Questions
 *     security:
 *       - UserBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: "What is the best way to learn JavaScript?"
 *     responses:
 *       201:
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Question created successfully"
 *       400:
 *         description: Bad request, missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Question is required"
 *       401:
 *         description: Unauthorized, missing or invalid authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Retrieve a paginated list of questions
 *     description: Fetches questions along with user details and their answers.
 *     tags:
 *       - User - Questions
 *     security:
 *       - UserBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of questions per page (default is 10).
 *     responses:
 *       200:
 *         description: Questions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a0b89d8f1d2e001bcf1f3c"
 *                           question:
 *                             type: string
 *                             example: "How do I improve my coding skills?"
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john.doe@example.com"
 *                           answers:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: "64a0c89d8f1d2e001bcf1f3d"
 *                                 text:
 *                                   type: string
 *                                   example: "Practice daily and work on projects."
 *                                 user:
 *                                   type: object
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                       example: "Jane Doe"
 *                                     email:
 *                                       type: string
 *                                       example: "jane.doe@example.com"
 *                     meta:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalQuestions:
 *                           type: integer
 *                           example: 50
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
/**
 * @swagger
 * /question/{id}/delete:
 *   delete:
 *     summary: Delete a question by ID
 *     description: Deletes a question if the authenticated user is the owner of the question.
 *     tags:
 *       - User - Questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question to delete
 *     security:
 *       - UserBearerAuth: []
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Question deleted successfully"
 *       403:
 *         description: User is not authorized to delete this question
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "You are not allowed to delete this question"
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Question not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error"
 */
/**
 * @swagger
 * /question/{id}/answer/{answerId}/delete:
 *   delete:
 *     summary: Delete an answer
 *     description: Deletes an answer by its ID within a specific question. Only the owner of the answer can delete it.
 *     tags:
 *       - User - Question - Answers
 *     security:
 *       - UserBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question containing the answer
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the answer to delete
 *     responses:
 *       200:
 *         description: Answer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Answer deleted successfully"
 *       403:
 *         description: Unauthorized to delete the answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You are not allowed to delete this answer"
 *       404:
 *         description: Question or Answer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Question not found or Answer not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
/**
 * @swagger
 * /question/{id}/answer:
 *   post:
 *     summary: Add an answer to a question
 *     tags:
 *       - User - Question - Answers
 *     security:
 *       - UserBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the question to answer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: The answer content
 *                 example: "This is the correct solution because..."
 *     responses:
 *       201:
 *         description: Answer added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Answer added successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Answer is required"
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Question not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 */
