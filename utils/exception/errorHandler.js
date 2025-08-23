export const errorHandler = (err, req, res, next) => {
  console.error(err); // para logs internos

  if (err.name === "ServiceException") {
    // Error forzado / esperado
    return res.status(err.status).json({
      error: true,
      status: err.status,
      message: err.message,
      data: null,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...err.extra, 
    });
  }

  // Error general no esperado
  return res.status(500).json({
    error: true,
    status: 500,
    message: "Internal Server Error",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

