import { Schema, model, models, Document } from "mongoose";

export interface IQuizProgress extends Document {
  userId: string;
  videoId: string;
  courseId: Schema.Types.ObjectId;
  quizStarted: boolean;
  quizCompleted: boolean;
  currentQuestionIndex: number;
  selectedAnswers: (string | null)[];
  showExplanations: boolean[];
  correctAnswers: boolean[];
  attemptedReinforcement: boolean[];
  mastered: boolean[];
  createdAt: Date;
  updatedAt: Date;
}

const quizProgressSchema = new Schema<IQuizProgress>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  quizStarted: {
    type: Boolean,
    default: false,
  },
  quizCompleted: {
    type: Boolean,
    default: false,
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  selectedAnswers: {
    type: [Schema.Types.Mixed],
    default: [],
  },
  showExplanations: {
    type: [Boolean],
    default: [],
  },
  correctAnswers: {
    type: [Boolean],
    default: [],
  },
  attemptedReinforcement: {
    type: [Boolean],
    default: [],
  },
  mastered: {
    type: [Boolean],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for efficient querying
quizProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const QuizProgress =
  models.QuizProgress || model("QuizProgress", quizProgressSchema);

export default QuizProgress;
