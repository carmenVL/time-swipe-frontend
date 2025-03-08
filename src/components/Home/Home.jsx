import React from "react";
import { Link } from "react-router-dom";
import Footer from "../Footer/Footer";

const Home = () => {
  return (
    <div className="animated-bg min-h-screen overflow-auto flex flex-col">
      <section className="bg-opacity-100 py-10 sm:py-16 lg:py-19">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-13 lg:grid-cols-2">
            <div>
              <p className="text-base font-semibold tracking-wider text-[#FF671F] uppercase">
                A social media for Whovians
              </p>
              <h1 className="mt-2 text-4xl font-bold text-white sm:text-6xl xl:text-8xl">
                Match through time and space
              </h1>
              <p className="mt-2 text-base text-green-500 sm:text-xl">
                Swipe into the world of Time Lords.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center px-6 py-4 mt-8 font-semibold text-black bg-yellow-300 rounded-full hover:bg-yellow-400"
                role="button"
              >
                Join for free
                <svg
                  className="w-6 h-6 ml-8 -mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Link>

              <p className="mt-5 text-zinc-200">
                Already joined us?{" "}
                <Link to="/login" className="text-blue-700 hover:underline">
                  Log in
                </Link>
              </p>
            </div>

            <div>
              <img
                className="w-full"
                src="/hero-img.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

