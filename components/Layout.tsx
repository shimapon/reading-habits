import Head from "next/head";
import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  isTop?: boolean;
};

export const Layout: React.FC<Props> = ({ children, isTop }) => {
  // 副作用フック（初期マウント時に実行）
  React.useEffect(() => {}, []);

  return (
    <>
      <Head>
        <title>読書習慣アプリ</title>
        <meta
          name="description"
          content="【読書習慣をつけよう！】読書習慣アプリは，あなたの日々の読書を応援します！少しだけでも良いので，その日読んだ本の内容をまとめて投稿をしていきましょう！公開を許可された投稿は他のユーザにも見ることができます！他の人が日々どんな本を読んで，どんなことを考えたのかを時系列で追うことができます！"
        />
      </Head>
      <main className="bg-gray-200 min-h-screen pb-14">
        {!isTop && (
          <div className="relative">
            <Link href="/" passHref>
              <div className="absolute z-10 cursor-pointer bg-gray-400 hover:bg-opacity-40 bg-opacity-50 sm:bg-opacity-0 rounded-full m-1 text-primary-contrastText">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 m-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
            </Link>
          </div>
        )}
        {children}
      </main>
    </>
  );
};
