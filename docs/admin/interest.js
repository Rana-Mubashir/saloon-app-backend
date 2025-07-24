/**
 * @swagger
 * /admin/interest/create:
 *   post:
 *     summary: Add a new interest
 *     description: Upload an interest with an image.
 *     tags:
 *       - Admin - Interests
 *     security:
 *       - AdminBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Upload a Image file for the interest"
 *     responses:
 *       201:
 *         description: Interest added successfully.
 *       409:
 *         description: Interest with this name already exists.
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /admin/interest/all:
 *   get:
 *     summary: Fetch all interests
 *     description: Retrieves a list of all interests available in the system.
 *     tags:
 *       - Admin - Interests
 *     security:
 *       - AdminBearerAuth: []
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
/**
 * @swagger
 * /admin/interest/{id}/delete:
 *   delete:
 *     summary: Delete an interest
 *     description: Deletes an interest by its ID and removes its associated image from Cloudinary.
 *     tags:
 *       - Admin - Interests
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the interest to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the interest.
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
 *                   example: "Interest deleted successfully"
 *       404:
 *         description: Interest not found.
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
 *                   example: "Interest not found"
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
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
/**
 * @swagger
 * /admin/interest/{id}/update:
 *   put:
 *     summary: Update an interest
 *     description: Updates an interest's name and/or image. If an image is provided, the existing one is replaced.
 *     tags:
 *       - Admin - Interests
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the interest to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Interest Name"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New image file to upload.
 *     responses:
 *       200:
 *         description: Successfully updated the interest.
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
 *                   example: "Interest updated successfully"
 *                 interest:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60c72b2f9b1d8c001f4d3b60"
 *                     name:
 *                       type: string
 *                       example: "Updated Interest Name"
 *                     image:
 *                       type: object
 *                       properties:
 *                         public_id:
 *                           type: string
 *                           example: "interest_images/abc123"
 *                         url:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/abc123.jpg"
 *       404:
 *         description: Interest not found.
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
 *                   example: "Interest not found"
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
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
