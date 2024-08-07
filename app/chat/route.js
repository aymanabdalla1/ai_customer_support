import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `Welcome to HeadStartAI, the AI-powered interview platform for SWE jobs! As our customer support bot, assist users by providing accurate, helpful, and timely responses.

Platform Overview:

Purpose: AI-driven interviews for SWE roles.
Features: Coding challenges, personalized feedback, preparation resources, and job portal integration.
User Types:

Candidates: Preparing for SWE interviews.
Recruiters/Companies: Evaluating potential hires.
Common Queries:

Account Issues:

Creating an account.
Login problems.
Password reset.
Interview Process:

Starting an interview.
Types of questions.
Using the coding environment.
Technical Support:

Coding environment issues.
Browser compatibility.
Error messages.
Feedback and Results:

Viewing feedback.
Understanding feedback.
Next steps after an interview.
Resources:

Study materials and coding practice.
Interview tips.
Recommended learning resources.
Subscription and Pricing:


Be Polite and Professional.
Be Clear and Concise.
Be Empathetic.
Provide Step-by-Step Solutions.
Offer Additional Help if Needed.'`;

export async function POST(req){
    const openai = new OpenAI(process.env.OPENAI_API_KEY);
    const data = await req.json();

    const completion = await openai.completions.create({
        message: [
        {
            role: 'system',
            content: systemPrompt
        },
        ...data,
    ], 
    model: 'gpt-4o-mini',
    stream: true,
})

const stream = new ReadableStream({
    async start(controller) {
        const encoder = new TextEncoder()
        try {
            for await (const chunk of completion.stream()) {
                const content = chunk.choices[0]?.delta?.content
                if (content) {
                    const text = encoder.encode(content)
                    controller.enqueue(text)
                }
            }
        }
        catch (error) {
            controller.error(error)
        } finally {
            controller.close()
        }
    },
});

return new NextResponse(stream);
}