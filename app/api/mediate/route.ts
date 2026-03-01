import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { messages, type, context } = body

        // 1. If Business Mode: Retrieve context from Supabase Vector DB
        // let retrievedContext = ""
        // if (type === "business") {
        //    retrievedContext = await getSimilarDocuments(messages.slice(-1)[0].content);
        // }

        // 2. Initialize Gemini 
        // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // 3. Construct prompt based on type
        let systemPrompt = "You are a neutral AI mediator tasked with finding common ground."
        if (type === "business") {
            systemPrompt = `You are an HR conflict resolution AI. Resolve the following conflict strictly based on the provided company policy context: \n\n${context}`
        } else if (type === "group") {
            systemPrompt = "You are a group consensus facilitator. Group viewpoints to find overlapping agreements."
        }

        // 4. Call Gemini
        // const result = await model.generateContent({
        //   contents: [{ role: "user", parts: [{ text: systemPrompt + JSON.stringify(messages) }] }]
        // });
        // const aiResponse = result.response.text();

        // Placeholder mock response
        const aiResponse = "This is a mocked AI response from the mediator endpoint."

        return NextResponse.json({
            role: "ai",
            content: aiResponse
        }, { status: 200 })

    } catch (error) {
        console.error("Error generating mediation:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
