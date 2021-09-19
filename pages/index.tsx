import { Layout } from "components/Layout";
import { Firebase } from "lib/firebase";
import { GetStaticProps, GetServerSideProps } from "next";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { Dialog, Switch, Transition } from "@headlessui/react";
import { motion } from "framer-motion";

import { Menu } from "@headlessui/react";

// ページコンポーネントに渡されるデータ
type Props = {
  mybooks_props: Book[];
  all_books: Book[];
};

type Book = {
  isbn: string;
  title: string;
  thumbnail: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let mybooks_props: Book[] = [];

  await Firebase.firestore()
    .collection("users")
    .doc("r0eGCtbNxDaWHcczKGdHPsq6Okm1")
    .collection("books")
    .get()
    .then(async (snapshots) => {
      snapshots.docs.map((doc) => {
        mybooks_props.push({
          isbn: doc.id,
          ...(doc.data() as { title: string; thumbnail: string }),
        });
      });
    });

  let all_books: Book[] = [];

  await Firebase.firestore()
    .collectionGroup("books")
    .get()
    .then(async (snapshots) => {
      snapshots.docs.map((doc) => {
        if (!all_books.find((v) => v.isbn === doc.id)) {
          all_books.push({
            isbn: doc.id,
            ...(doc.data() as { title: string; thumbnail: string }),
          });
        }
      });
    });

  return {
    props: { mybooks_props, all_books },
  };
};

const Login = () => {
  const provider = new Firebase.auth.GoogleAuthProvider();
  Firebase.auth()
    .signInWithRedirect(provider)
    .then(function (result: any) {
      return result;
    })
    .catch(function (error) {
      console.log(error);
      const errorCode = error.code;
      console.log(errorCode);
      const errorMessage = error.message;
      console.log(errorMessage);
    });
};

const Logout = (setfunc: Function) => {
  Firebase.auth().signOut;
  setfunc(null);
};

// ログイン状態の検知
const listenAuthState = (setfunc: Function) => {
  return Firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      setfunc(user);
      var userDoc = await Firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      if (!userDoc.exists) {
        // Firestore にユーザー用のドキュメントが作られていなければ作る
        await userDoc.ref.set({
          name: user.displayName,
        });
      }
    } else {
      console.log("error");
    }
  });
};

const Index: React.FC<Props> = ({ mybooks_props, all_books }) => {
  const [currentUser, setUser] = useState<firebase.default.User | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isbn, setISBN] = useState<string>("");
  const [mybooks, setMybooks] = useState<Book[]>([]);

  useEffect(() => {
    setMybooks(mybooks_props);

    return listenAuthState(setUser);
  }, []);

  const sendData = async () => {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:` + isbn
    );
    const data = await res.json();

    console.log(data);

    if (!data) {
      return false;
    }

    try {
      await Firebase.firestore()
        .collection("users")
        .doc(currentUser!.uid)
        .collection("books")
        .doc(isbn)
        .set({
          title: data.items[0].volumeInfo.title,
          thumbnail: data.items[0].volumeInfo.imageLinks.thumbnail,
        });
      let setbooks: Book[] = [];

      await Firebase.firestore()
        .collection("users")
        .doc(currentUser!.uid)
        .collection("books")
        .get()
        .then(async (snapshots) => {
          snapshots.docs.map((doc) => {
            setbooks.push(
              Object.assign(
                doc.data() as { title: string; thumbnail: string },
                {
                  isbn: doc.id,
                }
              )
            );
          });
        });

      setMybooks(setbooks);
    } catch (error) {
      console.log(error);
    }

    setIsOpen(false);
  };

  return (
    <Layout isTop>
      <div>
        <div className="flex items-center justify-between w-full p-6 mb-2 font-serif">
          <div className="flex items-center ">
            <h1 className="text-4xl  text-primary-contrastText ">
              読書習慣アプリ
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16.875 23.569"
              className="w-10 h-10 opacity-80"
              stroke="currentColor"
              fill="none"
            >
              <path
                fill="white"
                d="M6.471 23.396l-5.286-2.354a2 2 0 01-1.013-2.641L6.776 3.568a2 2 0 012.641-1.013l2.538 1.13-1.42.964a1.37 1.37 0 00-.616.579l4.9-3.326 2.056 1-4.945 3.366-2.033-1-.028.06a1.352 1.352 0 102.562.806l1.992-1.351.279.124a2 2 0 011.013 2.64l-6.6 14.832a2 2 0 01-2.641 1.014zm3.8-20.7l.432-2.7 1.877.826-.433 2.7z"
              ></path>
            </svg>
          </div>
          {!currentUser && (
            <button
              onClick={Login}
              className="rounded text-primary-contrastText bg-secondary p-2 shadow text-xl"
            >
              Login
            </button>
          )}
          {currentUser && (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button>
                  <img
                    src={currentUser.photoURL!}
                    alt={currentUser.displayName + "_profIMG"}
                    className="w-12 h-12 rounded-full"
                  />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => Logout(setUser)}
                          className={`${
                            active
                              ? "bg-primary-light text-primary-contrastText"
                              : "text-gray-900"
                          } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          ログアウト
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>

        <h2 className="text-3xl flex justify-start items-center m-1 font-bold text-primary-contrastText">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          About
        </h2>
        <div className=" font-serif font-bold justify-center flex items-center mx-auto p-3 text-xl text-primary-contrastText my-2 w-11/12 border-t-2 border-b-2  border-secondary-contrastText">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          習慣的に本を読んで，今日読んだ内容を
          <br />
          自分の中で解釈して投稿しよう！
        </div>

        <div className="font-serif font-bold justify-center items-center  flex mx-auto p-3 text-xl text-primary-contrastText my-2 w-11/12 border-b-2 border-secondary-contrastText">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          みんなの投稿でさらに理解を深めよう！
        </div>

        {!currentUser && (
          <div className="font-serif font-bold justify-center items-center  flex mx-auto p-3 text-xl text-primary-contrastText my-2 w-11/12 border-b-2 border-secondary-contrastText">
            早速ログイン！！ →
            <motion.button
              onClick={Login}
              className="ml-2 rounded  bg-secondary-light p-2 shadow text-xl hover:shadow-lg"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                times: [0, 0.45, 0.8],
              }}
            >
              Login
            </motion.button>
          </div>
        )}

        {currentUser && (
          <div>
            {/* Books */}
            <h2 className="text-3xl flex justify-start items-center m-1 font-bold  text-primary-contrastText">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Books
            </h2>
            <div className="text-center">
              <input
                type="text"
                className="w-96 text-2xl rounded border-2 border-gray-400 m-4"
              />
            </div>
            <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gr gap-1 m-3 justify-items-center">
              {mybooks.map((book: Book) => {
                return (
                  <Link
                    href={"mybooks/" + book.isbn}
                    passHref
                    key={book.title + "_key"}
                  >
                    <button className="shadow w-96 group">
                      <div className="px-2 py-3 bg-primary-light sm:bg-opacity-50 text-primary-contrastText text-center rounded-t group-hover:bg-opacity-100">
                        <p className="text-sm font-bold">{book.title}</p>
                      </div>
                      <div className="bg-gray-100 rounded-b">
                        <img
                          src={book.thumbnail}
                          alt={book.title + "_IMG"}
                          className="mx-auto py-3"
                        />
                      </div>
                    </button>
                  </Link>
                );
              })}
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-96 m-3 px-4 py-4 text-sm font-medium text-white bg-secondary rounded-md sm:bg-opacity-40 hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              >
                <div className="flex justify-center items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-5"
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
                  <p className="text-xl">本を追加する</p>
                </div>
              </button>
            </div>

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
                        <div className="flex gap-2 justify-between p-4 bg-gray-100 text-2xl">
                          <label htmlFor="">ISBN：</label>
                          <input
                            type="number"
                            className="border rounded w-full"
                            onChange={(e) => {
                              setISBN(e.target.value);
                            }}
                          />
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
                          onClick={sendData}
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
        )}

        {/* みんなの投稿 */}
        <h2 className="text-3xl flex justify-start items-center m-1 font-bold  text-primary-contrastText">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          みんなの投稿
        </h2>

        <div className="grid grid-cols-3 gap-1">
          {all_books.map((book: any) => {
            return (
              <Link
                href={"posts/" + book.isbn}
                passHref
                key={book.title + "_otherkey2"}
              >
                <button className=" transform hover:scale-110 duration-300">
                  <img
                    src={book.thumbnail}
                    alt={book.title + "_OTHERIMG"}
                    className="mx-auto py-3"
                  />
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
