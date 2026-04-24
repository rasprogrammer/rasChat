import z from "zod"; 

// Create Room Schema
export const CreateRoomSchema = z.object({
  roomName: z
    .string()
    .trim()
    .nonempty({ message: "Room name is required" })
    .min(3, { message: "Room name must be at least 3 characters long" }),
});