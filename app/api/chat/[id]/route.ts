import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Chat from "../../../../models/Chat";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const chat = await Chat.findOne({ _id: id, userId });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Transform messages to frontend format
    const messages = chat.messages.map((msg: any) => ({
      id: msg._id.toString(),
      role: msg.role.toUpperCase(), // Match enum Role
      text: msg.text,
      timestamp: msg.timestamp,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
