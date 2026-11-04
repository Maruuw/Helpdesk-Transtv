<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Webhook Verification Handshake (Meta Cloud API)
     * Meta memanggil endpoint GET ini saat pertama kali mendaftarkan webhook URL di dashboard Meta for Developers.
     */
    public function verifyWebhook(Request $request): Response|JsonResponse
    {
        $mode = $request->query('hub_mode', $request->query('hub.mode'));
        $token = $request->query('hub_verify_token', $request->query('hub.verify_token'));
        $challenge = $request->query('hub_challenge', $request->query('hub.challenge'));

        $expectedToken = config('services.whatsapp.verify_token', 'transtv-helpdesk-wa-token-2026');

        if ($mode === 'subscribe' && $token === $expectedToken) {
            Log::info('WhatsApp Webhook verification succeeded.');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('WhatsApp Webhook verification failed. Token mismatch or invalid mode.', [
            'mode' => $mode,
            'token_received' => $token,
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Verification token mismatch or invalid mode.',
        ], 403);
    }

    /**
     * Webhook Handler (Menerima Pesan Masuk dari User)
     * Menerima event pesan dari Meta Cloud API atau Gateway Pihak Ketiga, lalu membalas secara otomatis.
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('WhatsApp Webhook Received:', $payload);

        $from = null;
        $messageText = '';
        $buttonId = null;

        // 1. Parsing format Meta Cloud API
        if (isset($payload['entry'][0]['changes'][0]['value']['messages'][0])) {
            $msg = $payload['entry'][0]['changes'][0]['value']['messages'][0];
            $from = $msg['from'] ?? null;

            if (isset($msg['text']['body'])) {
                $messageText = $msg['text']['body'];
            } elseif (isset($msg['interactive']['button_reply']['id'])) {
                $buttonId = $msg['interactive']['button_reply']['id'];
                $messageText = $msg['interactive']['button_reply']['title'] ?? '';
            } elseif (isset($msg['button']['payload'])) {
                $buttonId = $msg['button']['payload'];
                $messageText = $msg['button']['text'] ?? '';
            }
        }
        // 2. Parsing format generic gateway (Fonnte / Wablas / Custom)
        elseif (isset($payload['sender']) || isset($payload['from'])) {
            $from = $payload['sender'] ?? $payload['from'];
            $messageText = $payload['message'] ?? $payload['text'] ?? '';
            $buttonId = $payload['button_id'] ?? $payload['payload'] ?? null;
        }

        if (empty($from)) {
            // Bisa berupa delivery status notification (sent/delivered/read) dari Meta
            return response()->json(['status' => 'ignored', 'message' => 'Non-message event or empty sender.']);
        }

        // Proses respon otomatis bot (Anti-Free-Chat & Triage)
        $replyPayload = $this->whatsAppService->processIncomingMessage($from, $messageText, $buttonId);

        // Kirim balasan ke nomor pengirim
        $sendResult = $this->whatsAppService->sendMessage($replyPayload);

        return response()->json([
            'status' => 'success',
            'action' => $replyPayload['action'] ?? 'unknown',
            'send_result' => $sendResult,
        ]);
    }

    /**
     * Endpoint Simulasi Pengujian (Tanpa Perlu Webhook Nyata)
     * Berguna untuk testing alur bot, deep-linking, dan pesan anti-free-chat langsung dari cURL / Postman / Dashboard Admin.
     */
    public function simulate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|string',
            'message' => 'nullable|string',
            'button_id' => 'nullable|string',
        ]);

        $from = $validated['from'] ?? '6281234567890';
        $message = $validated['message'] ?? 'halo';
        $buttonId = $validated['button_id'] ?? null;

        $replyPayload = $this->whatsAppService->processIncomingMessage($from, $message, $buttonId);

        return response()->json([
            'simulation' => true,
            'user_input' => [
                'from' => $from,
                'message' => $message,
                'button_id' => $buttonId,
            ],
            'action_triggered' => $replyPayload['action'] ?? 'unknown',
            'portal_url' => $this->whatsAppService->getPortalUrl(),
            'reply_preview' => [
                'recipient' => $replyPayload['recipient'] ?? $from,
                'text_message' => $replyPayload['text'] ?? '',
                'has_deep_link' => str_contains($replyPayload['text'] ?? '', $this->whatsAppService->getPortalUrl()),
            ],
            'raw_payload' => $replyPayload,
        ]);
    }

    /**
     * Notifikasi Tiket (Outbound Notification)
     * Mengirimkan WhatsApp ke user saat status tiket berubah (misal: Solved / Return).
     */
    public function sendTicketNotification(Request $request, string $noTiket): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'custom_message' => 'nullable|string',
        ]);

        $payload = $this->whatsAppService->buildTicketCreatedPayload(
            $validated['phone'],
            $noTiket,
            'Notifikasi Pembaruan Tiket Helpdesk'
        );

        $result = $this->whatsAppService->sendMessage($payload);

        return response()->json([
            'status' => 'success',
            'no_tiket' => $noTiket,
            'result' => $result,
        ]);
    }
}

