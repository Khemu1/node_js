import { Request, Response, NextFunction } from "express";

export default class ErrorMiddleware {
  static hanldeError(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (req.originalUrl.startsWith("/api/products")) {
      res.json({
        error: err.message,
        statusCode: 500,
      });
      next();
      return;
    }
    res.render("500");
    next();
    return;
  }

  static handleRoute(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.startsWith("/api/products")) {
      res.json({
        message: "Invalid API route",
        statusCode: 404,
      });
      next();
      return;
    }
    res.render("404");
    next();
  }
}
