import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { GetServerSideProps, GetStaticPaths } from "next";
import Link from "next/link";
import { Layout } from "components/Layout";
import { Firebase } from "lib/firebase";

type Props = {
  title: string;
  users_posts: UserPosts[];
};

type UserPosts = {
  name: string;
  posts: Post[];
};

type Post = {
  content: string;
  area: string;
  created_at: string;
  share: boolean;
  uid: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let posts: Post[] = [];
  const { params }: any = context;

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:` + params.id
  );
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  await Firebase.firestore()
    .collectionGroup("posts_" + params.id)
    .get()
    .then(async (snapshots) => {
      snapshots.docs.map((doc) => {
        if (doc.data().share) posts.push(doc.data() as Post);
      });
    });

  let users_posts: UserPosts[] = [];
  let uids: string[] = [];

  for (let post of posts) {
    if (uids.indexOf(post.uid) === -1) {
      uids.push(post.uid);
      await Firebase.firestore()
        .collection("users")
        .doc(post.uid)
        .get()
        .then((doc) =>
          users_posts.push({
            ...(doc.data() as { name: string }),
            posts: [post] as Post[],
          })
        );
    } else {
      users_posts[uids.indexOf(post.uid)].posts.push(post);
    }
  }

  return {
    props: { title: data.items[0].volumeInfo.title, users_posts },
  };
};

const Streamer: React.FC<Props> = ({ title, users_posts }) => {
  console.log(users_posts);
  const [isChat, setIsChat] = useState<boolean>(false);

  return (
    <Layout>
      <div>
        <h1 className="text-center text-4xl w-full text-primary-contrastText p-3 font-serif mb-2">
          {title}
        </h1>
        <div className="flex justify-end m-2">
          <button onClick={() => setIsChat(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`${
                isChat
                  ? "bg-secondary-light text-secondary-contrastText"
                  : "hover:bg-gray-300 bg-opacity-50"
              } h-8 w-8 rounded`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
          <button onClick={() => setIsChat(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`${
                isChat
                  ? "hover:bg-gray-300 bg-opacity-50"
                  : "bg-secondary-light text-secondary-contrastText"
              } h-8 w-8 rounded`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
        </div>
        <div className="grid grid-flow-row grid-cols-1 mx-2 gap-1">
          {users_posts.map((user, index) => {
            return (
              <div
                className="rounded border border-black p-1"
                key={user.name + index}
              >
                <h2>{user.name}</h2>
                <div className="bg-gray-100 p-1 overflow-auto h-60">
                  {user.posts.map(
                    (
                      post: {
                        content: string;
                        area: string;
                        created_at: string;
                        share: boolean;
                        uid?: string;
                      },
                      index: number
                    ) => {
                      return (
                        <div
                          className="container mx-auto pr-4 mt-6"
                          key={post.created_at + index + "_key"}
                        >
                          <div className="rounded w-60 bg-white max-w-xs mx-auto overflow-hidden shadow-lg">
                            <div className="h-20 bg-opacity-80 bg-primary flex items-center justify-between shadow">
                              <div className="p-6 w-full">
                                <h3 className="text-2xl text-gray-700 font-bold">
                                  {post.area}
                                </h3>
                                <div className="flex justify-end items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <p className="text-sm text-gray-500 ml-1">
                                    {post.created_at}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="pt-8 pb-14 text-lg ml-5">
                              {post.content}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Streamer;
