"use client";

import React from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import Link from "next/link";
import { motion } from "framer-motion";

import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShinyButton } from "@/components/magicui/shiny-button";
import CourseCarousel from "@/components/CourseCarousel";
import Navbar from "@/components/Navbar";

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

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
          <motion.div 
            className="z-10 flex min-h-14 items-center justify-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="flex-center h-7 rounded-full border border-zinc-700 bg-zinc-800 text-[12px] transition-all ease-in">
              <AnimatedShinyText className="inline-flex gap-2 items-center justify-center px-2 py-1 text-zinc-400 transition ease-out">
                <div className="w-3 h-3 rounded-full flex-center bg-[#ffc20b31] ">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f0bb1c8c]"></div>
                </div>
                <span>Interactive learning platform</span>
              </AnimatedShinyText>
            </div>
          </motion.div>

          <motion.h1 
            className="text-center bg-gradient-to-br from-white from-30% to-white/40 bg-clip-text py-6 font-medium leading-none tracking-tighter text-transparent text-balance text-3xl md:text-5xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Turn passive video watching
            <br className="block" /> into an active, search-driven,
            practice-oriented
            <br className="block" /> learning journey
          </motion.h1>
          
          <motion.div 
            className="w-full flex-center sm:mt-9 mt-2 mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Link href="/pricing">
              <ShinyButton className="w-auto">
                Start Learning
                <IoIosArrowRoundForward className="text-xl" />
              </ShinyButton>
            </Link>
          </motion.div>

          <motion.div 
            className="py-8 max-sm:py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <CourseCarousel courses={courses} />
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default page;
