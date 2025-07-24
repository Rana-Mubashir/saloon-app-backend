/**
 * @swagger
 * /user/interest/all:
 *   get:
 *     summary: Fetch all interests
 *     description: Retrieves a list of all interests available in the system.
 *     tags:
 *       - Users
 *     security:
 *       - UserBearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched interests.
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
 *                   example: "Interest fetched successfully"
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64a5fcd12345678b9e123456"
 *                       name:
 *                         type: string
 *                         example: "Technology"
 *                       image:
 *                         type: object
 *                         properties:
 *                           public_id:
 *                             type: string
 *                             example: "interest_images/abc123"
 *                           url:
 *                             type: string
 *                             example: "https://res.cloudinary.com/example/image/upload/abc123.jpg"
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
 *                   example: "Internal server error. Please try again later."
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
