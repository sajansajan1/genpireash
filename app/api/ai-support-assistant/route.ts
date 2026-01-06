import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Message } from "openai/resources/beta/threads/messages.mjs";

// Get API key and assistant ID at runtime to avoid build-time errors
function getOpenAIClient() {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in environment variables.");
  }
  return new OpenAI({ apiKey });
}

function getAssistantId() {
  const assistantId = process.env.NEXT_PUBLIC_OPEN_AI_ASSISTANT_ID;
  if (!assistantId) {
    throw new Error("Missing ASSISTANT_ID in environment variables.");
  }
  return assistantId;
}

export async function POST(req: NextRequest) {
  try {
    const { message }: { message: string } = await req.json();

    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    // Get client and assistant ID at runtime
    const client = getOpenAIClient();
    const assistantId = getAssistantId();

    // 1. Create thread
    const thread = await client.beta.threads.create();

    // 2. Add user message
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // 3. Create run
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // 4. Wait until assistant finishes
    let completedRun = run;

    while (completedRun.status === "queued" || completedRun.status === "in_progress") {
      await new Promise((r) => setTimeout(r, 800)); // wait 800ms

      completedRun = await client.beta.threads.runs.retrieve(run.id, {
        thread_id: thread.id,
      });
    }

    // 5. Now assistant response exists → fetch messages
    const messages = await client.beta.threads.messages.list(thread.id);

    // 6. get assistant message
    const assistantMsg = messages.data.find((m) => m.role === "assistant");

    function extractText(message: Message): string | null {
      for (const block of message.content) {
        if (block.type === "text") {
          return block.text?.value || null;
        }
      }
      return null;
    }

    const reply = assistantMsg ? extractText(assistantMsg) : "No response";

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
