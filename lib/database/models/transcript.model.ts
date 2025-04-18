import mongoose from "mongoose";

// Define the VideoTranscript schema for storing complete transcripts
export interface IVideoTranscript {
  videoId: string;
  videoTitle: string;
  transcript: string; // Full transcript as JSON string
  createdAt: Date;
  updatedAt: Date;
}

const videoTranscriptSchema = new mongoose.Schema<IVideoTranscript>({
  videoId: { type: String, required: true, unique: true, index: true },
  videoTitle: { type: String, required: true },
  transcript: { type: String, required: true }, // Full transcript as JSON string
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Define the ProcessedVideo schema to track which videos have been processed
export interface IProcessedVideo {
  videoId: string;
  processed: boolean;
  processingFailed: boolean;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const processedVideoSchema = new mongoose.Schema<IProcessedVideo>({
  videoId: { type: String, required: true, unique: true, index: true },
  processed: { type: Boolean, default: false },
  processingFailed: { type: Boolean, default: false },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create models or get existing models
export const VideoTranscript =
  mongoose.models.VideoTranscript ||
  mongoose.model<IVideoTranscript>("VideoTranscript", videoTranscriptSchema);

export const ProcessedVideo =
  mongoose.models.ProcessedVideo ||
  mongoose.model<IProcessedVideo>("ProcessedVideo", processedVideoSchema);

export default { VideoTranscript, ProcessedVideo };
