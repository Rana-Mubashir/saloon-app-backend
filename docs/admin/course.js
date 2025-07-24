/**
 * @swagger
 * /course/create:
 *   post:
 *     summary: Create a new course
 *     description: Creates a new course with a name, description, type, and optional thumbnail upload.
 *     tags:
 *       - Admin - Courses
 *     security:
 *       - AdminBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the course (e.g., online, offline)
 *                 example: "online"
 *               name:
 *                 type: string
 *                 description: The name of the course
 *                 example: "Introduction to JavaScript"
 *               description:
 *                 type: string
 *                 description: A brief description of the course
 *                 example: "A beginner-friendly course covering JavaScript basics."
 *               courseThumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Course thumbnail image file
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                   example: "Course created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a7a3b6c8d6f90015fdb123"
 *                     name:
 *                       type: string
 *                       example: "Introduction to JavaScript"
 *                     type:
 *                       type: string
 *                       example: "online"
 *       400:
 *         description: Bad request (invalid input or missing fields)
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
 *                   example: "Title and description are required"
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
 * /course/all:
 *   get:
 *     summary: Retrieve a paginated list of courses
 *     description: Fetches a list of courses with pagination support, sorted by creation date.
 *     tags:
 *       - Admin - Courses
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of courses per page (default is 10)
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                   example: "Courses retrieved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60a7a3b6c8d6f90015fdb123"
 *                           name:
 *                             type: string
 *                             example: "Introduction to JavaScript"
 *                           description:
 *                             type: string
 *                             example: "A beginner-friendly JavaScript course"
 *                           type:
 *                             type: string
 *                             example: "online"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalCourses:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: Invalid pagination parameters
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
 *                   example: "Invalid pagination parameters."
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
 *                   example: "Failed to fetch courses."
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
/**
 * @swagger
 * /course/{id}/update:
 *   put:
 *     summary: Update a course
 *     description: Updates the details of an existing course, including its name, description, type, and thumbnail image.
 *     tags:
 *       - Admin - Courses
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "60a7a3b6c8d6f90015fdb123"
 *         description: The ID of the course to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "online"
 *                 description: The type of course (e.g., online, offline).
 *               name:
 *                 type: string
 *                 example: "Advanced JavaScript"
 *                 description: The new name of the course.
 *               description:
 *                 type: string
 *                 example: "An in-depth JavaScript course."
 *                 description: The new description of the course.
 *               courseThumbnail:
 *                 type: string
 *                 format: binary
 *                 description: The new thumbnail image for the course.
 *     responses:
 *       200:
 *         description: Course updated successfully.
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
 *                   example: "Course updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a7a3b6c8d6f90015fdb123"
 *                     name:
 *                       type: string
 *                       example: "Advanced JavaScript"
 *                     type:
 *                       type: string
 *                       example: "online"
 *                     description:
 *                       type: string
 *                       example: "An in-depth JavaScript course."
 *                     thumbnail:
 *                       type: string
 *                       example: "cloudinary-public-id"
 *       400:
 *         description: Invalid course type or missing parameters.
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
 *                   example: "Invalid course type"
 *       404:
 *         description: Course not found.
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
 *                   example: "Course not found"
 *       500:
 *         description: Server error.
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
 *                   example: "Failed to upload new course thumbnail"
 */
/**
 * @swagger
 * /course/{id}/delete:
 *   delete:
 *     summary: Delete a course
 *     description: Deletes a course along with all associated lessons and their media (thumbnails and videos) from Cloudinary.
 *     tags:
 *       - Admin - Courses
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "60a7a3b6c8d6f90015fdb123"
 *         description: The ID of the course to delete.
 *     responses:
 *       200:
 *         description: Course and its lessons deleted successfully.
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
 *                   example: "Course and its lessons deleted successfully"
 *       404:
 *         description: Course not found.
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
 *                   example: "Course not found"
 *       500:
 *         description: Server error.
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
