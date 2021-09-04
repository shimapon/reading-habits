import { Layout } from "components/Layout";
import type { NextPage } from "next";

Layout;
const Home: NextPage = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-center text-4xl">読書週間アプリ</h1>
      </div>
    </Layout>
  );
};

export default Home;
