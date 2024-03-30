"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import Thread from "../models/thread.model";
// import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );

    if (path === "/profile/update") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.meassge}`);
  }
}

export async function fetchUser(id: string) {
  connectToDB();
  return await User.findOne({ id: id });
}

export async function searchUser({
  userID,
  searchString = "",
  pageNumber = 1,
  pageSize = 10,
  sortBy = "desc",
}: {
  userID: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userID },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const userQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUserCount = await User.countDocuments(query);

    const users = await userQuery.exec();
    const isNext = totalUserCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Error fetching Users: ${error.meassge}`);
  }
}

export async function getNotification(userID: string) {
  try {
    connectToDB();
    const userThreads = await Thread.find({ author: userID });
    const childThreads = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    },[]);
    const replies = await Thread.find({
      _id: { $in: childThreads },
      author: { $ne: userID },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to get Notification:${error.meassge}`);
  }
}
