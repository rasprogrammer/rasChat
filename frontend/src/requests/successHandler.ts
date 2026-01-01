import type { ApiResponse } from "./types";
import codeMessage from "./codeMessage";
import useNotify from "../hooks/useNotify";

interface SuccessHandlerOptions {
  notifyOnSuccess?: boolean;
  notifyOnFailed?: boolean;
}

export default function successHandler(
  response: ApiResponse,
  options: SuccessHandlerOptions = { notifyOnSuccess: false, notifyOnFailed: true }
): ApiResponse {
  console.log('success Handler > ', response);
  const { notify } = useNotify();

  const statusMessage = response.message || codeMessage[200];

  if (response.success) {
    if (options.notifyOnSuccess) {
      notify("success", statusMessage);
    }
    return response;
  } 

  if (options.notifyOnFailed) {
    notify("error", statusMessage);
  }

  return response;
}