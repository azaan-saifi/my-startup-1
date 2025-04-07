"use client";

import React, { useState, useEffect } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShinyButton } from "@/components/magicui/shiny-button";
import Navbar from "@/components/Navbar";

// Animation variants
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Define the pricing plan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

const PricingPage = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing plans from the API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/pricing');
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          throw new Error(`Failed to fetch pricing plans: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched pricing plans:', data);
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn('Empty or invalid pricing data received, using fallback data');
          // Fallback data in case API returns empty result
          setPlans([
            {
              id: "1",
              name: "Basic Bender",
              price: 29,
              interval: "monthly",
              description: "Perfect for beginners looking to start their coding journey.",
              features: [
                "Access to core courses",
                "Practice exercises",
                "Community forum access",
                "Monthly coding challenges",
                "Email support"
              ],
              isPopular: false,
            },
            {
              id: "2",
              name: "Master Bender",
              price: 89,
              interval: "monthly",
              description: "For serious learners ready to master the code of the Matrix.",
              features: [
                "All Basic features",
                "Advanced courses",
                "1-on-1 mentoring sessions",
                "Project reviews",
                "Priority support",
                "Certificate of completion",
                "Job opportunity alerts"
              ],
              isPopular: true,
            }
          ]);
        } else {
          setPlans(data);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
        setError('Failed to load pricing plans. Please try again later.');
        
        // Use fallback data in case of error
        setPlans([
          {
            id: "1",
            name: "Basic Bender",
            price: 29,
            interval: "monthly",
            description: "Perfect for beginners looking to start their coding journey.",
            features: [
              "Access to core courses",
              "Practice exercises",
              "Community forum access",
              "Monthly coding challenges",
              "Email support"
            ],
            isPopular: false,
          },
          {
            id: "2",
            name: "Master Bender",
            price: 89,
            interval: "monthly",
            description: "For serious learners ready to master the code of the Matrix.",
            features: [
              "All Basic features",
              "Advanced courses",
              "1-on-1 mentoring sessions",
              "Project reviews",
              "Priority support",
              "Certificate of completion",
              "Job opportunity alerts"
            ],
            isPopular: true,
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPricingPlans();
  }, []);

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
                <span>Choose your learning plan</span>
              </AnimatedShinyText>
            </div>
          </motion.div>

          <motion.h1 
            className="text-center bg-gradient-to-br from-white from-30% to-white/40 bg-clip-text py-6 font-medium leading-none tracking-tighter text-transparent text-balance text-3xl md:text-5xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Start your journey to becoming
            <br className="block" /> a code bender today
          </motion.h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-zinc-400">Loading pricing plans...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-rose-500">{error}</div>
            </div>
          ) : (
            <motion.div 
              className="w-full flex justify-center gap-8 mt-12 max-w-5xl mx-auto max-lg:flex-col max-lg:items-center"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {plans.map((plan) => (
                <motion.div 
                  key={plan.id}
                  variants={fadeInUp}
                  className={`relative flex flex-col w-full max-w-md bg-black/60 backdrop-blur-sm border ${plan.isPopular ? 'border-zinc-700' : 'border-zinc-800'} rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/20%)]`}
                >
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${plan.isPopular ? 'via-[#f0bb1c]/50' : 'via-white/30'} to-transparent`}></div>
                  
                  {plan.isPopular && (
                    <>
                      <div className="absolute inset-0 border border-[#f0bb1c]/20 rounded-lg pointer-events-none"></div>
                      <div className="absolute top-6 right-6">
                        <div className="px-3 py-1 bg-[#ffc20b31] rounded-full border border-[#f0bb1c]/30">
                          <span className="text-xs font-medium text-[#f0bb1c]">RECOMMENDED</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-zinc-400 ml-1">/month</span>
                    </div>
                    <p className="mt-4 text-zinc-400 text-sm">{plan.description}</p>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheck className="text-[#f0bb1c] mt-1 mr-2" />
                          <span className="text-zinc-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-6 border-t border-zinc-800">
                    <ShinyButton 
                      className={`w-full justify-center ${plan.isPopular ? 'bg-[#ffc20b10] border-[#f0bb1c]/30' : ''}`}
                    >
                      {plan.isPopular ? 'Become a Master' : 'Get Started'}
                      <IoIosArrowRoundForward className="text-xl" />
                    </ShinyButton>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
              All plans include a 14-day money-back guarantee. No questions asked.
              <br />Need a custom plan for your team? <a href="#" className="text-[#f0bb1c] hover:underline">Contact us</a> for enterprise pricing.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default PricingPage; 