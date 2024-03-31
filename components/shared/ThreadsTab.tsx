import { fetchUserThreads } from "@/lib/actions/thread.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountID: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountID, accountType }: Props) => {
  let result: any;
  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountID);
  } else result = await fetchUserThreads(accountID);
  // console.log(result);
  
  if (!result) {
    redirect("/");
  }

  return (
    <>
      <section className="mt-9 flex flex-col gap-10">
        {result.threads.map((thread: any) => {
          // console.log(thread);
          
          return <ThreadCard
            key={thread._id}
            id={thread._id}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            content={thread.text}
            author={
              accountType === "User"
                ? { name: result.name, image: result.image, id: result.id }
                : {
                    name: thread.author.name,
                    image: thread.author.image,
                    id: thread.author.id,
                  }
            }
            community={thread.community}
            createdAt={thread.createdAt}
            comments={thread.children}
          />
          })}
      </section>
    </>
  );
};

export default ThreadsTab;
