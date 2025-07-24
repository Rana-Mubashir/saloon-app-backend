/**
 * @swagger
 * /contact/create:
 *   post:
 *     summary: Create a new contact submission
 *     description: Allows users to submit a contact request with their name, email, and message.
 *     tags:
 *       - User - Contacts
 *     security:
 *       - UserBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               message:
 *                 type: string
 *                 example: "I need support with my account."
 *     responses:
 *       201:
 *         description: Contact submitted successfully.
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
 *                   example: "Contact submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1d8c001f4d3b60"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "johndoe@example.com"
 *       400:
 *         description: Bad request, missing required fields.
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
 *                   example: "Name, email, and message are required."
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
