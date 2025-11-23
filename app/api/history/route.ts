import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Chat from "../../../models/Chat";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await connectToDatabase();

    // Fetch last 50 chats for the sidebar
    const chats = await Chat.find({ userId })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50);

    const formattedChats = chats.map((chat) => ({
      id: chat._id.toString(),
      title: chat.title,
      updatedAt: chat.updatedAt,
    }));

    // Calculate total number of messages sent by the user across all chats
    const stats = await Chat.aggregate([
      { $match: { userId } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "user" } },
      { $count: "count" },
    ]);

    const messageCount = stats.length > 0 ? stats[0].count : 0;

    return NextResponse.json({
      chats: formattedChats,
      messageCount,
    });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "ID and UserID required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await Chat.deleteOne({ _id: id, userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
