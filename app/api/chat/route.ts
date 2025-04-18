import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

import { saveChatMessage } from "@/lib/actions/chatHistory.action";
import { VideoTranscript } from "@/lib/database/models/transcript.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function POST(req: NextRequest) {
  const { messages, currentTimestamp, videoId, userId, courseId } =
    await req.json();
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
          videoTitle: "Video from Chat", // Default title
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

    // Save the user's message to chat history if userId and courseId are provided
    if (userId && videoId && courseId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        console.log("Saving user message to chat history:", {
          userId,
          videoId,
          contentLength: lastMessage.content.length,
        });

        await saveChatMessage(userId, videoId, courseId, {
          role: lastMessage.role,
          content: lastMessage.content,
        });
      }
    }

    // Flag to track if the assistant response has been saved
    let savedAssistantResponse = false;

    // Stream the AI response
    const response = streamText({
      model: google("gemini-2.0-flash-001"),
      system: `You are an AI Learning Assistant for an educational platform with video lectures.
Your goal is to help students understand the video content, navigate to relevant parts of lectures, and provide additional explanations.

You have access to transcripts from the video lectures, and you can:
1. Help users find specific moments in videos where topics were discussed
2. Explain concepts from the lectures in simpler terms or provide more details
3. Connect related topics across different parts of the lectures
4. Provide direct links to specific timestamps in videos

When responding:
- If the user asks where something was mentioned, provide the video link with the correct timestamp
- If the user is confused about the current part of the lecture, provide a simpler explanation
- If the user wants an example, try to elaborate on the topic with practical examples
- If the user wants to jump to a specific time, extract the timestamp and fetch relevant content

IMPORTANT: When you find relevant information in a video, ALWAYS include a link to the exact timestamp.
Use the format: [watch this part](https://youtube.com/watch?v=${videoId}&t={start})

To ensure the link works correctly with the video player, make sure to include the full URL including https:// prefix.

Here's the videoId: ${videoId}
Here's user's current time in the lecture, in case he didn't specify - Current time: ${currentTimestamp}
And here's the whole transcript of the video:
${JSON.stringify(transcriptData)}
.
`,
      messages,
      async onFinish(completion) {
        // Save the assistant's response to chat history if userId and courseId are provided
        if (userId && videoId && courseId && !savedAssistantResponse) {
          savedAssistantResponse = true;
          try {
            console.log("Saving assistant response to chat history:", {
              userId,
              videoId,
              contentLength: completion.text.length,
              time: new Date().toISOString(),
            });

            const result = await saveChatMessage(userId, videoId, courseId, {
              role: "assistant",
              content: completion.text,
            });

            console.log("Save assistant message result:", result);
          } catch (error) {
            console.error("Error saving assistant message:", error);
          }
        } else {
          console.warn("Missing data for saving assistant message:", {
            hasUserId: !!userId,
            hasVideoId: !!videoId,
            hasCourseId: !!courseId,
            alreadySaved: savedAssistantResponse,
          });
        }
      },
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ message: "Error while fetching", error });
  }
}
