import React, { Fragment, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { Layout } from "components/Layout";
import { Dialog, Switch, Transition } from "@headlessui/react";
import { Login, Logout, auth, Firebase } from "lib/firebase";

type Post = {
  content: string;
  area: string;
  created_at: string;
  share: boolean;
  uid: string;
};

type Props = {
  posts_props: Post[];
  title: string;
  isbn: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let posts_props: Post[] = [];
  const { params }: any = context;
  const isbn = params.id;

  await Firebase.firestore()
    .collection("users")
    .doc(auth.currentUser?.uid)
    .collection("books")
    .doc(params.id)
    .collection("posts_" + params.id)
    .get()
    .then(async (snapshots) => {
      snapshots.docs.map((doc) => {
        posts_props.push(doc.data() as Post);
      });
    });

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:` + params.id
  );
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { posts_props, title: data.items[0].volumeInfo.title, isbn },
  };
};

const returnDate = () => {
  let date = new Date();
  return date.toLocaleString("ja");
};

const Streamer: React.FC<Props> = ({ posts_props, title, isbn }) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [area, setArea] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getMYPosts();
  }, [auth.currentUser]);

  const getMYPosts = async () => {
    let posts: Post[] = [];

    await Firebase.firestore()
      .collection("users")
      .doc(auth.currentUser?.uid)
      .collection("books")
      .doc(isbn)
      .collection("posts_" + isbn)
      .orderBy("created_at")
      .get()
      .then(async (snapshots) => {
        snapshots.docs.map((doc) => {
          posts.push(doc.data() as Post);
        });
      });
    setPosts(posts);
  };

  const sendData = async () => {
    try {
      await Firebase.firestore()
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("books")
        .doc(isbn)
        .collection("posts_" + isbn)
        .add({
          created_at: returnDate(),
          content: content,
          area: area,
          share: enabled,
          uid: auth.currentUser?.uid,
        });

      let posts: Post[] = [];
      await Firebase.firestore()
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("books")
        .doc(isbn)
        .collection("posts_" + isbn)
        .get()
        .then(async (snapshots) => {
          snapshots.docs.map((doc) => {
            posts.push(doc.data() as Post);
          });
        });
      setPosts(posts);
    } catch (error) {
      console.log(error);
    }

    setIsOpen(false);
  };

  return (
    <Layout>
      <div>
        <h1 className="text-center text-4xl w-full text-primary-contrastText p-3 font-serif mb-2">
          {title}
        </h1>
        {posts.map((post: Post, index: number) => {
          return (
            <div
              className="container mx-auto pr-4 mt-6"
              key={post.created_at + index}
            >
              <div className="rounded w-96 bg-white max-w-xs mx-auto overflow-hidden shadow-lg">
                <div className="h-20 bg-opacity-80 bg-primary flex items-center justify-between shadow">
                  <div className="p-6 w-full">
                    <div className="flex justify-between py-2">
                      <h3 className="text-2xl text-gray-700 font-bold">
                        {post.area}
                      </h3>
                      <div className="flex items-center">
                        {post.share && (
                          <p className="rounded-2xl bg-secondary text-secondary-contrastText w-min px-2 py-1 shadow">
                            share
                          </p>
                        )}
                        <button
                          className="bg-gray-400 rounded-full p-1 bg-opacity-0 hover:bg-opacity-40 ml-1"
                          onClick={() => alert("編集できる")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
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
                <p className="pt-8 pb-14 text-lg ml-5">{post.content}</p>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setIsOpen(true)}
          className="sm:bg-opacity-80 shadow bg-secondary text-secondary-contrastText rounded-full p-3 fixed right-2 bottom-2 transition hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <Transition appear show={isOpen} as={Fragment}>
          <Dialog
            onClose={() => setIsOpen(false)}
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0" />
              </Transition.Child>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md my-20 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <form>
                    <div className="flex gap-2 justify-between bg-primary-light p-4">
                      <div className="">
                        <label htmlFor="">読んだ部分：</label>
                        <input
                          type="text"
                          className="border w-full rounded"
                          onChange={(e) => {
                            setArea(e.target.value);
                          }}
                        />
                      </div>
                      <div className="m-1">
                        <p className="font-bold mb-1">share</p>
                        <Switch
                          checked={enabled}
                          onChange={setEnabled}
                          className={`${
                            enabled ? "bg-secondary" : "bg-gray-200"
                          } relative inline-flex items-center h-6 rounded-full w-11`}
                        >
                          <span className="sr-only">Enable notifications</span>

                          <span
                            className={`${
                              enabled ? "translate-x-6" : "translate-x-1"
                            } inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
                          />
                        </Switch>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-100">
                      <p>コメント</p>
                      <textarea
                        name=""
                        id=""
                        rows={8}
                        className="w-full border border-gray-200 rounded"
                        onChange={(e) => {
                          setContent(e.target.value);
                        }}
                      ></textarea>
                    </div>
                  </form>
                  <div className="flex justify-center pt-2 gap-2 p-4 bg-gray-100">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded p-2 flex-1 text-primary hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendData()}
                      className="rounded border-2 p-2 flex-1 bg-primary text-primary-contrastText bg-opacity-70 hover:bg-opacity-100"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  );
};

export default Streamer;
