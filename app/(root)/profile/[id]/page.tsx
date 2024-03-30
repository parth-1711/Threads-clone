import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";

const Page = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(params.id);
  console.log(userInfo?.onboarded);
  
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }
  return (
    <>
      <section>
        <ProfileHeader
          accountID={userInfo.id}
          authUserId={user.id}
          name={userInfo.name}
          userName={userInfo.username}
          imgURL={userInfo.image}
          bio={userInfo.bio}
        />

        <div className="mt-9">
          <Tabs defaultValue="threads" className="w-full">
            <TabsList className="tab">
              {profileTabs.map((tab) => (
                <TabsTrigger value={tab.value} className="tab" key={tab.label}>
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    height={24}
                    width={24}
                    className="object-contain"
                  />
                  <p className="max-sm:hidden">{tab.label}</p>
                  {tab.label==='Threads' && (
                    <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                      {userInfo?.threads?.length}
                    </p>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {profileTabs.map((tab)=>(
              <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-light-1">
                <ThreadsTab 
                currentUserId={user.id}
                accountID={userInfo.id}
                accountType="User"
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default Page;
