import { fetchUser, getNotification } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  const notifications = await getNotification(userInfo._id);
  return (
    <>
      <section>
        <h1 className="head-text mb-10">Activity</h1>
        <section className="mt-10 flex flex-col gap-5">
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <Link
                  key={notification._id}
                  href={`/thread/${notification.parentId}`}
                >
                  <article className="activity-card">
                    <Image
                      src={notification.author.image}
                      alt="Profile Image"
                      height={20}
                      width={20}
                      className="ronded-full object-cover"
                    />
                    <p className="!text-small-regular text-light-1">
                      <span className="mr-1 text-primary-500">{notification.author.name}</span> replied to your
                      thread
                    </p>
                  </article>
                </Link>
              ))}
            </>
          ) : (
            <p className="text-base-regular text-gray-1">
              Looks Like Nothing happened while you were away
            </p>
          )}
        </section>
      </section>
    </>
  );
};

export default Page;
