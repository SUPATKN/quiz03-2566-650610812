import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const roomID = request.nextUrl.searchParams.get("roomId");
  readDB();

  const findRoomId = DB.rooms.find((x) => x.roomId === roomID);
  if (!findRoomId)
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );

  const allMessages = [];
  for (const mess of DB.messages) {
    if (mess.roomId === roomID) {
      allMessages.push(mess);
    }
  }
  return NextResponse.json({
    ok: true,
    message: allMessages,
  });
};

export const POST = async (request) => {
  const body = await request.json();
  const { roomId, messageText } = body;
  readDB();

  const findRoomId = DB.rooms.find((x) => x.roomId === body.roomId);
  if (!findRoomId)
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );

  const messageId = nanoid();

  DB.messages.push({ roomId, messageId, messageText });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
  const body = await request.json();
  const payload = checkToken();
  const { messageId } = body;

  if (payload === null) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  const role = payload.role;
  readDB();
  const findIndexMess = DB.messages.findIndex((x) => x.messageId === messageId);
  if (findIndexMess === -1)
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  if (role === "ADMIN") {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  DB.messages.splice(findIndexMess, 1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
