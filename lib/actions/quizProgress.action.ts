"use server";

import QuizProgress from "../database/models/quizProgress.model";
import { connectToDatabase } from "../database/mongoose";

// Interface for quiz state to be saved/updated
export interface QuizState {
  quizStarted?: boolean;
  quizCompleted?: boolean;
  currentQuestionIndex?: number;
  selectedAnswers?: (string | null)[];
  showExplanations?: boolean[];
  correctAnswers?: boolean[];
  attemptedReinforcement?: boolean[];
  mastered?: boolean[];
}

/**
 * Get quiz progress for a specific video and user
 */
export async function getQuizProgress(videoId: string, userId: string) {
  try {
    await connectToDatabase();

    // Find or create progress record
    const quizProgress = await QuizProgress.findOne({
      userId,
      videoId,
    });

    // If no record exists, return empty object
    if (!quizProgress) {
      return JSON.stringify({
        quizStarted: false,
        quizCompleted: false,
        currentQuestionIndex: 0,
        selectedAnswers: [],
        showExplanations: [],
        correctAnswers: [],
        attemptedReinforcement: [],
        mastered: [],
      });
    }

    return JSON.stringify(quizProgress.toObject());
  } catch (error) {
    console.error("Error getting quiz progress:", error);
    throw error;
  }
}

/**
 * Update quiz progress for a specific video and user
 */
export async function updateQuizProgress(
  videoId: string,
  userId: string,
  courseId: string,
  quizState: QuizState
) {
  try {
    await connectToDatabase();

    // Create the update object
    const updateData = {
      ...quizState,
      updatedAt: new Date(),
    };

    // Update or create the record
    const result = await QuizProgress.findOneAndUpdate(
      { videoId, userId, courseId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return JSON.stringify(result.toObject());
  } catch (error) {
    console.error("Error updating quiz progress:", error);
    throw error;
  }
}

/**
 * Check if quiz is completed for a specific video
 */
export async function isQuizCompleted(videoId: string, userId: string) {
  try {
    await connectToDatabase();

    const quizProgress = await QuizProgress.findOne({
      userId,
      videoId,
      quizCompleted: true,
    });

    return !!quizProgress;
  } catch (error) {
    console.error("Error checking quiz completion:", error);
    throw error;
  }
}

/**
 * Mark quiz as completed for a specific video
 */
export async function completeQuiz(
  videoId: string,
  userId: string,
  courseId: string
) {
  try {
    await connectToDatabase();

    const result = await QuizProgress.findOneAndUpdate(
      { videoId, userId, courseId },
      { $set: { quizCompleted: true, updatedAt: new Date() } },
      { new: true, upsert: true }
    );

    return JSON.stringify(result.toObject());
  } catch (error) {
    console.error("Error completing quiz:", error);
    throw error;
  }
}
