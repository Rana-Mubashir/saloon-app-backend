/**
 * @swagger
 * /user/faqs/all:
 *   get:
 *     summary: Retrieve a paginated list of questions
 *     description: Fetches questions along with user details and their answers.
 *     tags:
 *       - User - FAQS
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
