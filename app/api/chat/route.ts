import { NextRequest } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Chat, { IChat } from "../../../models/Chat";
import { geminiService } from "@/services/GeminiService";

const MAX_MESSAGES_PER_USER = 20;

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId, chatId } = await req.json();

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Connect to DB early
    await connectToDatabase();

    // Check total message usage for the user
    // We count only 'user' messages to track quota
    const stats = await Chat.aggregate([
      { $match: { userId } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "user" } },
      { $count: "count" },
    ]);

    const currentMessageCount = stats.length > 0 ? stats[0].count : 0;

    if (currentMessageCount >= MAX_MESSAGES_PER_USER) {
      return new Response(
        `Message limit reached. You have used ${MAX_MESSAGES_PER_USER}/${MAX_MESSAGES_PER_USER} messages. Please contact support or upgrade to continue.`,
        { status: 403 }
      );
    }

    let currentChatId = chatId;
    let chatDoc: IChat | null = null;

    if (currentChatId) {
      chatDoc = await Chat.findById(currentChatId);
    }

    // If no chat exists, create one
    if (!chatDoc) {
      // Generate a title from the first few words of the message
      const title = message.slice(0, 30) + (message.length > 30 ? "..." : "");
      chatDoc = await Chat.create({
        userId,
        title,
        messages: [],
      });
      if (chatDoc) {
        currentChatId = chatDoc._id.toString();
      }
    }

    // Save User Message
    if (chatDoc) {
      chatDoc.messages.push({
        role: "user",
        text: message,
        timestamp: Date.now(),
      });
      await chatDoc.save();
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const generator = geminiService.streamChat(message, history || []);

          let fullResponse = "";

          for await (const chunk of generator) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          // Save Model Response to DB after streaming is complete
          if (chatDoc) {
            // Re-fetch to minimize race conditions
            await Chat.findByIdAndUpdate(currentChatId, {
              $push: {
                messages: {
                  role: "model",
                  text: fullResponse,
                  timestamp: Date.now(),
                },
              },
            });
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Id": currentChatId || "", // Send back the Chat ID so the client can update URL
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
