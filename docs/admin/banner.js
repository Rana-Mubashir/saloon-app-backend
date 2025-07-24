/**
 * @swagger
 * /admin/banners:
 *   get:
 *     summary: Retrieve all banners
 *     description: Fetches a list of all available banners.
 *     tags:
 *       - Admin - Banners
 *     security:
 *       - AdminBearerAuth: []
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
 *                   example: "Internal server error"
 */
/**
 * @swagger
 * /admin/banner/create:
 *   post:
 *     summary: Add a new banner
 *     description: Uploads an image file to Cloudinary and saves the banner details.
 *     tags:
 *       - Admin - Banners
 *     security:
 *       - AdminBearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to be uploaded.
 *     responses:
 *       201:
 *         description: Successfully added a new banner.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60a7d21f4b1e2c001c8b0e1a"
 *                 image:
 *                   type: object
 *                   properties:
 *                     public_id:
 *                       type: string
 *                       example: "banner_12345"
 *                     url:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/banner.jpg"
 *       400:
 *         description: Image file is required.
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
 *                   example: "Image file is required"
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
 *                   example: "Error details"
 */
/**
 * @swagger
 * /banner/{id}/update:
 *   put:
 *     summary: Update a banner
 *     description: Updates a banner by ID, allowing image replacement via file upload.
 *     tags:
 *       - Admin - Banners
 *     security:
 *       - AdminBearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the banner to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The new image file to be uploaded.
 *     responses:
 *       200:
 *         description: Banner updated successfully.
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
 *                   example: "Banner updated successfully"
 *                 Banner:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60a7d21f4b1e2c001c8b0e1a"
 *                     image:
 *                       type: object
 *                       properties:
 *                         public_id:
 *                           type: string
 *                           example: "banner_12345"
 *                         url:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/banner.jpg"
 *       404:
 *         description: Banner not found.
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
 *                   example: "Banner not found"
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
 *                   example: "Error details"
 */

/**
 * @swagger
 * /banner/{id}/delete:
 *   delete:
 *     summary: Delete a banner
 *     description: Deletes a banner by ID and removes the associated image from Cloudinary.
 *     tags:
 *       - Admin - Banners
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the banner to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner deleted successfully.
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
 *                   example: "Banner deleted successfully"
 *       404:
 *         description: Banner not found.
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
 *                   example: "Banner not found"
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
 *                   example: "Error details"
 */
