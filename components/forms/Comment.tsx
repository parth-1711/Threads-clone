"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { usePathname, useRouter } from "next/navigation";
import { Commentvalidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  currentuser: string;
  currentUserImage: string;
}

const Comment = ({ threadId, currentUserImage, currentuser }: Props) => {
  const router = useRouter();
  const pathName = usePathname();

  const form = useForm({
    resolver: zodResolver(Commentvalidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof Commentvalidation>) => {
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentuser),
      pathName
    );

    form.reset()

    // router.push("/");
  };
  return (
    <>
      <div className="text-white">Comment Form</div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 w-full">
                <FormLabel>
                  <Image
                    src={currentUserImage}
                    alt="profile picture"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                </FormLabel>
                <FormControl className="border-none bg-transparent">
                  <Input
                    placeholder="Comment..."
                    {...field}
                    className="no-focus text-light-1 outline-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="comment-form_btn">
            {" "}
            Reply
          </Button>
        </form>
      </Form>
    </>
  );
};

export default Comment;
