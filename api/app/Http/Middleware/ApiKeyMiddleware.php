<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expectedKey = env('HELPDESK_API_KEY', 'transtv-helpdesk-secret-key-2026');

        // Check header 'X-API-KEY' or 'X-Api-Key' or bearer or query parameter 'api_key'
        $providedKey = $request->header('X-API-KEY') 
            ?? $request->header('x-api-key') 
            ?? $request->query('api_key');

        if (!$providedKey || !hash_equals($expectedKey, (string)$providedKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Invalid or missing API Key. Harap sertakan header X-API-KEY yang valid.',
            ], 401);
        }

        return $next($request);
    }
}
