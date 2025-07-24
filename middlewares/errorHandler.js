export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the full stack trace for debugging
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
