/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Retrieve all banners
 *     description: Fetches a list of all available banners.
 *     tags:
 *       - User - Banners
 *     security:
 *       - UserBearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved banners.
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
 *                   example: "Banners fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60a7d21f4b1e2c001c8b0e1a"
 *                       title:
 *                         type: string
 *                         example: "Summer Sale"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/banner.jpg"
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
 *                   example: "Internal Server Error"
 */
