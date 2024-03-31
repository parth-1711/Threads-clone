import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { profileTabs } from "@/constants";
import Image from "next/image";
import UserCard from "@/components/cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";

const Page = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  const result = await fetchCommunities({
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });

  return (
    <>
      <section>
        <h1 className="head-text mb-10">Communities</h1>

        <div className="mt-14 flex flex-col gap-9">
            {result.communities.length===0 ? (
                <p className="no-result">Looks Like No One's Here</p>
            ):<>
            {result.communities.map((Community)=>(
                <CommunityCard
                key={Community.id}
                id={Community.id}
                name={Community.name}
                username={Community.username}
                imgUrl={Community.image}
                bio={Community.bio}
                members={Community.members}
                />
            ))}
            </>}
        </div>
      </section>
    </>
  );
};

export default Page;
