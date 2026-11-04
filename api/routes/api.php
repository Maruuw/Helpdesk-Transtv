<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WhatsAppController;

/*
|--------------------------------------------------------------------------
| TRANS TV Helpdesk REST API Routes
|--------------------------------------------------------------------------
|
| Endpoint untuk menghubungkan frontend React ke database MySQL db_helpdesk.
| Dilindungi dengan middleware 'api.key' (Header: X-API-KEY).
|
*/

// Public Auth Endpoint
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// WhatsApp Gateway Endpoints (Meta Cloud API Webhook & Testing Simulation)
Route::prefix('whatsapp')->group(function () {
    Route::get('/webhook', [WhatsAppController::class, 'verifyWebhook']);
    Route::post('/webhook', [WhatsAppController::class, 'handleWebhook']);
    Route::post('/simulate', [WhatsAppController::class, 'simulate']);
});

// Protected API Routes (Memerlukan X-API-KEY)
Route::middleware('api.key')->group(function () {
    
    // WhatsApp Outbound Notifications (Protected)
    Route::post('/whatsapp/notify/{no_tiket}', [WhatsAppController::class, 'sendTicketNotification']);

    // Dashboard Stats & Analytics
    Route::get('/dashboard/stats', [TicketController::class, 'dashboardStats']);
    Route::get('/reports', [TicketController::class, 'report']);

    // Tickets Management
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{no_tiket}', [TicketController::class, 'show']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{no_tiket}/responses', [TicketController::class, 'addResponse']);
    Route::post('/tickets/{no_tiket}/attachments', [TicketController::class, 'uploadAttachment']);

    // Categories Management
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

});
