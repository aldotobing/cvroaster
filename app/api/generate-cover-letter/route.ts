import { NextResponse } from 'next/server';
import { generateCoverLetterStream } from '@/lib/cover-letter-service';
import { CoverLetterOptions, CVReview } from '@/types/cv-review';

export async function POST(request: Request) {
  try {
    const { 
      cvText, 
      jobRole, 
      tone = 'professional', 
      length = 'medium',
      highlightSkills = true,
      includePersonalTouch = true,
      companyName,
      jobDescription,
      customInstructions = '',
      language = 'english' 
    } = await request.json();

    if (!cvText || !jobRole) {
      return NextResponse.json(
        { error: 'CV text and job role are required' },
        { status: 400 }
      );
    }

    const options: CoverLetterOptions = {
      tone,
      length,
      highlightSkills,
      includePersonalTouch,
      customInstructions,
      language
    };

    // Create a mock CVReview with required fields
    const mockCVReview: CVReview = {
      score: 0,
      strengths: [],
      weaknesses: [],
      structureFeedback: '',
      grammarFeedback: '',
      suggestions: [],
      provider: 'Gemini',
      atsScore: 0,
      atsFeedback: '',
      cvText
    };

    try {
      // Get the streaming response from the service
      const stream = await generateCoverLetterStream({
        cvText,
        jobRole,
        options,
        companyName,
        jobDescription,
        language,
        cvReview: mockCVReview
      });

      // Create a new stream that formats the chunks for SSE
      const sseStream = new ReadableStream({
        async start(controller) {
          try {
            const reader = stream.getReader();
            let fullContent = '';
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              fullContent += value;
              
              // Send each chunk as an SSE event
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ chunk: value })}\n\n`
                )
              );
            }
            
            // Send completion event
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ 
                  complete: true, 
                  coverLetter: fullContent 
                })}\n\n`
              )
            );
            
            controller.close();
          } catch (error) {
            console.error('Error processing stream:', error);
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ 
                  error: error instanceof Error ? error.message : 'Failed to process stream',
                  isError: true
                })}\n\n`
              )
            );
            controller.close();
          }
        },
        cancel() {
          console.log('SSE stream was cancelled by the client');
        }
      });

      return new Response(sseStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Error in generate-cover-letter API:', error);
      // Return a stream with the error message
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ 
                error: error instanceof Error ? error.message : 'Failed to generate cover letter',
                isError: true
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(errorStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
  } catch (error) {
    console.error('Error in cover letter generation endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process cover letter request' },
      { status: 500 }
    );
  }
}
