interface errorsList {
    type: string;
    msg: string;
    path: string;
    location: string;
}

export interface ErrorMessageType {
    errors: errorsList[];
}