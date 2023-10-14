import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

const instructionMessages: ChatCompletionMessage = {
  role: "system",
  content:
    "You are a code generator, you must answer only in markdown code snippets. User code comments for explaination",
};
export async function POST(req: Request) {
  try {
    //check if authentificated
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;
    if (!userId) {
      return new NextResponse("Unauthroized", { status: 401 });
    }
    if (!openai.apiKey) {
      return (
        new NextResponse("OpenAI API Key not configurated"), { status: 500 }
      );
    }
    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [instructionMessages, ...messages],
    });
    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
