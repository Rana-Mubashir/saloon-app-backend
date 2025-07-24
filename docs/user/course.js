/**
 * @swagger
 * /user/course/all:
 *   get:
 *     summary: Retrieve a paginated list of courses
 *     description: Fetches a list of courses with pagination support, sorted by creation date.
 *     tags:
 *       - Users
 *     security:
 *       - UserBearerAuth: []
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
 * /user/courses:
 *   get:
 *     summary: Get the list of courses the user is enrolled in.
 *     description: Fetches the paginated list of courses that the authenticated user is enrolled in.
 *     tags:
 *       - Users
 *     security:
 *       - UserBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination (default is 1).
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of courses per page (default is 10).
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved enrolled courses.
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
 *                   example: "Courses retrieved successfully"
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
 *                             example: "60d21b4667d0d8992e610c85"
 *                           name:
 *                             type: string
 *                             example: "React for Beginners"
 *                           type:
 *                             type: string
 *                             example: "Online"
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
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       400:
 *         description: Invalid pagination parameters.
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
 * /user/course/{id}/unenroll:
 *   delete:
 *     summary: Unenroll from a course
 *     description: Allows an authenticated user to unenroll from a specific course.
 *     tags:
 *       - Users
 *     security:
 *       - UserBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the course to unenroll from.
 *         schema:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Successfully unenrolled from the course.
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
 *                   example: "Unenrolled successfully"
 *                 course:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "React for Beginners"
 *                     type:
 *                       type: string
 *                       example: "Online"
 *       400:
 *         description: User is not enrolled in the specified course.
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
 *                   example: "Not enrolled in this course"
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
 * /user/course/{id}/enroll:
 *   post:
 *     summary: Enrolls the authenticated user in a course.
 *     description: Allows a logged-in user to enroll in a specific course.
 *     tags:
 *       - Users
 *     security:
 *       - UserBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the course to enroll in.
 *         schema:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Successfully enrolled in the course.
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
 *                   example: "Enrolled successfully"
 *                 course:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "React for Beginners"
 *                     type:
 *                       type: string
 *                       example: "Online"
 *       400:
 *         description: User is already enrolled in the course.
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
 *                   example: "Already enrolled in this course"
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
