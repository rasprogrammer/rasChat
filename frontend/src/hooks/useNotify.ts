import { toast, type ToastOptions } from "react-toastify";

export type NotificationType = "info" | "error" | "success";
export const notificationTypes: NotificationType[] = ["info", "error", "success"];

const useNotify = () => {
    

    const notify = (type: NotificationType, msg: string, options?: ToastOptions) => {
        if (!notificationTypes.includes(type)) {
            console.warn(`Invalid toast type: ${type}`);
            return;
        }
        
        toast[type](msg, {
            position: "top-right",
            autoClose: 2000,
            ...options,
        })        
    }

    return { notify };
}

export default useNotify;