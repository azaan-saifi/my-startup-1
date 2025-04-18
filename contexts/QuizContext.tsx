"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextType {
  isQuizActive: boolean;
  setQuizActive: (active: boolean) => void;
  quizCompleted: boolean;
  setQuizCompleted: (completed: boolean) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizCompleted, setQuizCompletedState] = useState(false);

  const setQuizActive = (active: boolean) => {
    setIsQuizActive(active);
  };

  const setQuizCompleted = (completed: boolean) => {
    setQuizCompletedState(completed);
  };

  return (
    <QuizContext.Provider
      value={{
        isQuizActive,
        setQuizActive,
        quizCompleted,
        setQuizCompleted,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
