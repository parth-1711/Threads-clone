"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`failed to create Thread Info: ${error.message}`);
  }
}

export async function fetchPost(pageNumber = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;
  const postQuery = Thread.find({
    parentId: { $in: [null, undefined] },
  })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalThreadCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postQuery.exec();

  const isNext = totalThreadCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id: string) {
  connectToDB();
  try {
    const thraed = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thraed;
  } catch (error: any) {
    throw new Error(`Error fetching Thread details: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();
  try {
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("No such Thread exist");
    }

    const comment = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedComment = await comment.save();

    originalThread.children.push(savedComment._id);
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(
      `Error while Adding comment to the thread : ${error.message}`
    );
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectToDB();
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });

    return threads;
  } catch (error: any) {
    throw new Error(`Faled to fetch threads for the user: ${error.message}`);
  }
}
