import type { AxiosError } from "axios";
import codeMessage from "./codeMessage";
import useNotify from "../hooks/useNotify";
import type { ApiResponse } from "./types";

export default function errorHandler(error: AxiosError): ApiResponse {
  console.log('error Handler > ', error);
  const { notify } = useNotify();

  // INTERNET OFF
  if (!navigator.onLine) {
    notify("error", "No internet connection");
    return {
      success: false,
    //   result: null,
      message: "Cannot connect to the server. Check your network."
    };
  }

  const response = error.response;

  // NO SERVER RESPONSE
  if (!response) {
    notify("error", "Cannot reach the server");
    return {
      success: false,
    //   result: null,
      message: "Server unreachable. Try again later."
    };
  }

  const msg = (response.data as any)?.message || codeMessage[response.status];

  notify("error", msg);

  return {
    success: false,
    // result: null,
    message: msg
  };
}