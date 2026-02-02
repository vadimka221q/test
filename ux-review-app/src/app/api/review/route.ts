import { NextRequest, NextResponse } from 'next/server';
import { generateUXReview, ImageData, ReviewContext } from '@/lib/claude';

export const maxDuration = 60;

interface ReviewRequest {
  images: ImageData[];
  context: ReviewContext;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const body: ReviewRequest = await request.json();
    const { images, context } = body;

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    if (images.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    for (const image of images) {
      if (!image.base64 || !image.mediaType) {
        return NextResponse.json(
          { error: 'Invalid image data format' },
          { status: 400 }
        );
      }

      const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(image.mediaType)) {
        return NextResponse.json(
          { error: `Invalid image type: ${image.mediaType}. Supported: PNG, JPG, GIF, WebP` },
          { status: 400 }
        );
      }
    }

    const review = await generateUXReview(images, context);

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Review generation error:', error);

    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }

      if (error.message.includes('invalid_api_key')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate review. Please try again.' },
      { status: 500 }
    );
  }
}
