import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
export default async function Home() {
  const user = await currentUser();
  // if (!user) return null;

  // const userInfo = await fetchUser(user.id);
  // console.log(userInfo?.onboarded)
  // if (!userInfo?.onboarded) redirect("/onboarding");
  const result = await fetchPosts(1, 30);

  // console.log(result);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p>Looks like there is nothing here !</p>
        ) : (
          <>
            {result.posts.map((post) => {
              return (
                <ThreadCard
                  key={post._id}
                  id={post._id}
                  currentUserId={user?.id || " "}
                  parentId={post.parentId}
                  content={post.text}
                  author={post.author}
                  community={post.community}
                  createdAt={post.createdAt}
                  comments={post.children}
                />
              );
            })}
          </>
        )}
      </section>
    </>
  );
}
