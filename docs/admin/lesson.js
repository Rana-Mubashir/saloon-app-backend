/**
 * @swagger
 * /courses/{id}/lessons:
 *   post:
 *     summary: Add a lesson to a course
 *     description: Adds a new lesson to the specified course. Supports physical, live, and video lesson types.
 *     tags:
 *       - Admin - Lessons
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "60a7a3b6c8d6f90015fdb123"
 *         description: The ID of the course to add the lesson to.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [physical, live, video]
 *                 description: The type of the lesson.
 *               title:
 *                 type: string
 *                 example: "Introduction to JavaScript"
 *                 description: The title of the lesson.
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-08-01T10:00:00.000Z"
 *                 description: Required for physical and live lessons.
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-08-01T12:00:00.000Z"
 *                 description: Required for physical and live lessons.
 *               location:
 *                 type: string
 *                 example: "Room 101, ABC Institute"
 *                 description: Required for physical lessons.
 *               streamLink:
 *                 type: string
 *                 example: "https://zoom.us/j/123456789"
 *                 description: Required for live lessons.
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Required for video lessons.
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Optional thumbnail image for the lesson.
 *     responses:
 *       201:
 *         description: Lesson added successfully.
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
 *                   example: "Lesson added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request (e.g., invalid lesson type, missing required fields).
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
 *                   example: "Invalid lesson type"
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
/**
 * @swagger
 * /course/{id}/lesson/{lessonId}/update:
 *   put:
 *     summary: Update a lesson within a course
 *     description: Update details of a lesson, including title, type, start date, end date, location, stream link, video, and thumbnail.
 *     tags:
 *       - Admin - Lessons
 *     security:
 *       - AdminAdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lesson to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the lesson (e.g., "video", "live")
 *               title:
 *                 type: string
 *                 description: The title of the lesson
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date of the lesson
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date of the lesson
 *               location:
 *                 type: string
 *                 description: The physical or virtual location of the lesson
 *               streamLink:
 *                 type: string
 *                 description: The stream link for live lessons
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: The video file for the lesson (if applicable)
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: The thumbnail image for the lesson
 *     responses:
 *       200:
 *         description: Lesson updated successfully
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
 *                   example: Lesson updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated course data including lessons
 *       400:
 *         description: Invalid lesson type
 *       404:
 *         description: Course or lesson not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /course/{id}/lesson/all:
 *   get:
 *     summary: Retrieve lessons from a course with pagination
 *     description: Fetch a paginated list of lessons belonging to a specific course.
 *     tags:
 *       - Admin - Lessons
 *     security:
 *       - AdminAdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of lessons per page (default is 10)
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
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
 *                   example: Lessons retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     lessons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Lesson details
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalLessons:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       400:
 *         description: Invalid pagination parameters.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Failed to fetch lessons due to server error.
 */
/**
 * @swagger
 * /course/{id}/lesson/{lessonId}/delete:
 *   delete:
 *     summary: Delete a lesson from a course
 *     description: Remove a specific lesson from a course and delete associated media from Cloudinary.
 *     tags:
 *       - Admin - Lessons
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lesson to be deleted
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
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
 *                   example: Lesson deleted successfully.
 *                 data:
 *                   type: object
 *                   description: Updated course object after deletion
 *       404:
 *         description: Course or lesson not found
 *       500:
 *         description: Failed to delete lesson due to server error
 */
