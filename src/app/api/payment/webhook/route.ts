import { POST as mainWebhookPost } from '@/app/api/webhook/route';

export async function POST(request: Request) {
    return mainWebhookPost(request);
}