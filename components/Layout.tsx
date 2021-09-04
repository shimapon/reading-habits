import Head from "next/head";
import React, { useEffect, useState, useContext } from "react";

type Props = {
  children: React.ReactNode;
};

export const Layout: React.FC<Props> = ({ children }) => {
  // 副作用フック（初期マウント時に実行）
  React.useEffect(() => {}, []);

  return (
    <>
      <Head>
        <title>読書週間をつけるアプリ</title>
        <meta name="description" content="読書週間をつけるアプリ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-1 bg-gray-200 min-h-screen">{children}</main>
    </>
  );
};
