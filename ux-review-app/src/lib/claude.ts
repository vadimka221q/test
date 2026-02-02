import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ReviewContext {
  productType: string;
  targetUsers: string;
  primaryGoal: string;
  platform: string;
  constraints: string;
}

export interface ImageData {
  base64: string;
  mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
}

export async function generateUXReview(
  images: ImageData[],
  context: ReviewContext
): Promise<string> {
  const imageContent: Anthropic.ImageBlockParam[] = images.map((img) => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: img.mediaType,
      data: img.base64,
    },
  }));

  const userPrompt = buildUserPrompt(context);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContent,
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from Claude');
  }

  return textBlock.text;
}
