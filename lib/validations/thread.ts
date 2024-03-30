import * as z from "zod";

export const Threadvalidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters!" }),
  accountId: z.string().nonempty(),
});

export const Commentvalidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters!" }),
});
