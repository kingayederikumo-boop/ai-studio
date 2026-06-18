import { NextRequest, NextResponse } from "next/server";
import { ChatNVIDIA } from "@langchain/nvidia-ai-endpoints";

// --- Router Logic ---
class RoundRobinRouter {
  private models: ChatNVIDIA[];
  private currentIndex: number = 0;

  constructor(models: ChatNVIDIA[]) {
    if (models.length === 0) throw new Error("At least one model is required");
    this.models = models;
  }

  async getNextModel() {
    const modelToUse = this.models[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.models.length;
    return modelToUse;
  }
}

// --- POST Handler ---
export async function POST(req: NextRequest) {
  try {
    // 1. Initialize all your models by reading the keys from Vercel env vars
    const model1 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_1,
      model: "nvidia/nemotron-3-ultra-550b-a55b"
    });
    const model2 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_2,
      model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning" 
    });
    const model3 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_3,
      model: "qwen/qwen2.5-coder-32b-instruct" 
    });
    const model4 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_4,
      model: "deepseek-ai/deepseek-v4-pro"
    });
    const model5 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_5,
      model: "moonshotai/kimi-k2.6"
    });

    const router = new RoundRobinRouter([model1, model2, model3, model4, model5]);
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content;

    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    // 2. Automatically select the next model in the rotation
    const selectedModel = await router.getNextModel();
    console.log(`🤖 Routing to model: ${selectedModel.model}`);

    // 3. Invoke the selected model
    const response = await selectedModel.invoke(lastUserMessage);

    return NextResponse.json({ 
      content: response.content,
      usedModel: selectedModel.model 
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}