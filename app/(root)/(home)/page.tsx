import React from "react";
import { IoIosArrowRoundForward } from "react-icons/io";

import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import Navbar from "@/components/Navbar";
import { ShinyButton } from "@/components/magicui/shiny-button";
import CourseCarousel from "@/components/CourseCarousel";

const courses = [
  {
    id: "1",
    title: "A Halal Roadmap To $10,000/Month for Muslim Developers (2025)",
    description:
      "If you are a dev wanting to make an extra $3-10k/mo selling AI implementations, go here: https://www.lastcodebender.com/incubator?vid=3eu4IZOCzIw",
    imageUrl: "/course1.jpg", // Add images or use placeholders
  },
  {
    id: "2",
    title: "I Taught 6 Beginners To Build an AI Project (with no experience)",
    description:
      "🔑 Get my FREE 'Noob to AI Developer' roadmap: https://lastcodebender.com/ai-developer",
    imageUrl: "/course2.jpg",
  },
  {
    id: "3",
    title: "I am starting the Last Codebender Nation",
    description: `code·bend·er: [Definition] 
Unique individual who has unlocked the ability to read the code of the Matrix, and shape it at will.
He is not just some programmer with no purpose.
He has a holistic view of every situation.
This makes him a feared opponent for all the agents of the Matrix.
Because the Codebender is not a slave to the system,
He only uses his ability for the sake of mankind.`,
    imageUrl: "/course3.jpg",
  },
];

const page = () => {
  return (
    <>
      <Navbar />
      <section className="flex-center flex-col">
        <div className="container">
          <div className="z-10 flex min-h-14 items-center justify-center">
            <div className="flex-center h-7 rounded-full border border-zinc-700 bg-zinc-800 text-[12px] transition-all ease-in">
              <AnimatedShinyText className="inline-flex gap-2 items-center justify-center px-2 py-1 text-zinc-400 transition ease-out">
                <div className="w-3 h-3 rounded-full flex-center bg-[#ffc20b31] ">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f0bb1c8c]"></div>
                </div>
                <span>Interactive learning platform</span>
              </AnimatedShinyText>
            </div>
          </div>

          <h1 className="text-center bg-gradient-to-br from-white from-30% to-white/40 bg-clip-text py-6 max-sm:text-3xl font-medium leading-none tracking-tighter text-transparent text-balance sm:text-6xl md:text-3xl lg:text-5xl">
            Turn passive video watching
            <br className="block" /> into an active, search-driven,
            practice-oriented
            <br className="block" /> learning journey
          </h1>
          <div className="w-full flex-center sm:mt-9 mt-2 mb-16">
            <ShinyButton className="w-auto">
              Start Learning
              <IoIosArrowRoundForward className="text-xl" />
            </ShinyButton>
          </div>

          <div className="py-8 max-sm:py-4">
            <CourseCarousel courses={courses} />
          </div>
        </div>
      </section>
    </>
  );
};

export default page;
