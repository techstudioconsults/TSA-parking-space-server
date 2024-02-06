const methodNotAllowed = (req, res) => {
  return res.status(405).json({
    message: `Method ${req.method} not allowed on ${req.originalUrl}`,
  });
};

module.exports = methodNotAllowed;
