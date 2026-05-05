import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import { verifyRequestToken } from "@/lib/auth";
import { handleApiError, AuthenticationError } from "@/lib/errors";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    const userId = new mongoose.Types.ObjectId(token.userId);

    // Get all unique conversations for user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipientId", userId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          participants: {
            $push: {
              $cond: [
                { $eq: ["$senderId", userId] },
                "$recipientId",
                "$senderId",
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      {
        $limit: 50,
      },
    ]);

    // Populate participant details
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const participantId = conv.participants[0];
        const participant = await User.findById(participantId).select(
          "name email"
        );

        return {
          conversationId: conv._id,
          participant,
          lastMessage: {
            content: conv.lastMessage.content,
            createdAt: conv.lastMessage.createdAt,
            isRead: conv.lastMessage.isRead,
            senderId: conv.lastMessage.senderId,
          },
          unreadCount: conv.unreadCount,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    return handleApiError(error);
  }
}
