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
      model: "meta/llama-3.1-8b-instruct" // Replace with your specific model ID
    });
    const model2 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_2,
      model: "your-second-model-id"
    });
    const model3 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_3,
      model: "your-third-model-id"
    });
    const model4 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_4,
      model: "your-fourth-model-id"
    });
    const model5 = new ChatNVIDIA({ 
      apiKey: process.env.NVIDIA_API_KEY_5,
      model: "your-fifth-model-id"
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