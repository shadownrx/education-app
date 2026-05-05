import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Subject from "@/models/Subject";
import Student from "@/models/Student";
import User from "@/models/User";
import { handleApiError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/errors";
import { canAccessSubject, requireAuth, toObjectId } from "@/lib/apiAuth";
import { messageSchema, validateInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await requireAuth(request);

    // Get conversation ID from query params
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    if (!conversationId) {
      throw new ValidationError("conversationId query parameter is required");
    }

    const userId = toObjectId(token.userId);
    const conversation = await Message.findOne({
      conversationId,
      $or: [{ senderId: userId }, { recipientId: userId }],
    }).select("subjectId");

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    await canAccessSubject(token, conversation.subjectId.toString());

    // Fetch messages in conversation
    const messages = await Message.find({
      conversationId,
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .populate("senderId", "name email")
      .populate("recipientId", "name email")
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read if user is recipient
    await Message.updateMany(
      {
        conversationId,
        recipientId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await requireAuth(request);

    const body = await request.json();
    const { recipientId, subjectId, content, conversationId } = validateInput(messageSchema, body);

    await canAccessSubject(token, subjectId);

    const recipient = await User.findById(toObjectId(recipientId));
    if (!recipient) {
      throw new NotFoundError("Recipient not found");
    }

    if (token.role === "teacher") {
      const student = await Student.findOne({
        userId: recipient._id,
        subjectId: toObjectId(subjectId),
      });
      if (!student) {
        throw new AuthorizationError("Recipient is not enrolled in this subject");
      }
    } else {
      const subject = await Subject.findById(toObjectId(subjectId));
      if (!subject || subject.teacherId.toString() !== recipient._id.toString()) {
        throw new AuthorizationError("Students can only message their subject teacher");
      }
    }

    // Create message
    const message = await Message.create({
      senderId: token.userId,
      recipientId,
      subjectId,
      content,
      conversationId,
      isRead: false,
    });

    // Populate sender info
    await message.populate("senderId", "name email");
    await message.populate("recipientId", "name email");

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
