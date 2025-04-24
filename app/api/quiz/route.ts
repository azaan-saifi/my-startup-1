// import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";

import { VideoTranscript } from "@/lib/database/models/transcript.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { QuizResponseSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { videoId, videoTitle } = await req.json();
  let transcriptData;

  try {
    // Connect to the database
    await connectToDatabase();

    // Find the transcript in MongoDB
    const videoTranscriptDoc = await VideoTranscript.findOne({ videoId });

    if (!videoTranscriptDoc) {
      // If not in database, fetch it from the API as fallback
      console.log("Transcript not found in database, fetching from API...");
      const url = `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/download-json/${videoId}?language=en`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY!,
          "x-rapidapi-host": process.env.RAPID_API_TRANSCRIPT_HOST!,
        },
      };

      console.log("Transcription in progress...");
      const youtube = await fetch(url, options);
      const transcript = await youtube.json();

      if (!transcript) throw new Error("Failed to fetch transcript from API");
      console.log("Transcription fetched from API.");

      // Store the transcript for future use
      await VideoTranscript.findOneAndUpdate(
        { videoId },
        {
          videoId,
          videoTitle: videoTitle || "Video from Quiz",
          transcript: JSON.stringify(transcript),
          updatedAt: new Date(),
        },
        { upsert: true }
      );

      // Use the fetched transcript
      transcriptData = transcript;
    } else {
      // Parse the stored JSON string
      console.log("Transcript found in database.");
      transcriptData = JSON.parse(videoTranscriptDoc.transcript);
    }

    const systemPrompt = `
You are an expert educational content developer specializing in creating intellectually challenging quiz questions from video content. Your task is to analyze the provided video transcript and generate thoughtful quiz questions that test deep understanding rather than mere recall.

## Question Generation Guidelines

### Primary Questions
- Create questions that require critical thinking, application of concepts, or analysis of the material
- Focus on the most important concepts, insights, and practical applications from the video
- Ensure questions connect theoretical knowledge to real-world situations
- Include questions that address common misconceptions about the topic
- Target different cognitive levels (understanding, application, analysis, evaluation)
- For each question, identify the specific timestamp in the video where the relevant information appears

### Answer Options
- Create one clearly correct answer and three plausible distractors
- Ensure distractors represent common misunderstandings or partial understanding
- Make all options approximately the same length and grammatical structure
- Avoid obvious patterns in correct answer placement
- Don't use "all/none of the above" or "both A and B" type options
- Ensure options are mutually exclusive

### Explanations
- Provide concise yet thorough explanations for why the correct answer is right
- Explain specifically why each incorrect option is wrong
- Include relevant additional context or examples that deepen understanding
- Connect explanations to practical applications or real-life scenarios when possible
- Use a conversational, engaging tone that encourages learning

## Reinforcement Questions

When creating reinforcement questions (follow-up questions if the user answers incorrectly):

- Target the specific misconception likely behind the wrong answer
- Create simpler questions that break down the complex concept into more digestible parts
- Design questions that approach the same concept from a different angle
- Include scenarios or examples that illuminate the concept in a new way
- Make reinforcement questions progressively easier to build confidence
- Ensure reinforcement questions form a logical pathway back to understanding the original question
- Use concrete examples or analogies to clarify abstract concepts
- Consider using "building block" questions that establish prerequisite knowledge

## Quality Assurance

Before finalizing your questions:
- Verify each question has exactly one unambiguously correct answer
- Ensure questions are clear, concise, and free of cultural bias
- Check that questions test understanding rather than trivia or minor details
- Confirm questions are appropriately challenging but fair
- Make sure questions reflect the actual content of the video without introducing new material
- Verify that timestamps accurately match when concepts are discussed in the video

Using your educational expertise, transform this video transcript into an engaging, challenging, and educational quiz experience.
The video title is: "${videoTitle}"

Here's the transcript excerpt:
${JSON.stringify(transcriptData)}`;

    const result = await generateObject({
      // model: google("gemini-2.5-pro-exp-03-25"),
      model: openai("gpt-4o-mini"),
      schema: QuizResponseSchema,
      prompt: systemPrompt,
    });

    return NextResponse.json({
      questions: result.object.questions,
      videoId,
      videoTitle,
    });
  } catch (aiError) {
    console.error("Error generating quiz with AI:", aiError);
    return NextResponse.json({ error: "Error generating the quiz" });
  }
}
