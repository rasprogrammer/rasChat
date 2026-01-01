import { Response } from "express";

const sendResponse = (
  res: Response,
  status: number,
  success: boolean,
  data?: any,
  message?: string
) => {
  res.status(status).json({ success, message, data });
};

export default sendResponse;