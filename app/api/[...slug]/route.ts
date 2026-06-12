import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Base URL for your actual backend
const NEXT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const API_WITH_PATH = NEXT_API_URL.endsWith("/api") ? NEXT_API_URL : `${NEXT_API_URL}/api`;
const BACKEND_URL = API_WITH_PATH.endsWith("/") ? API_WITH_PATH : `${API_WITH_PATH}/`;

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    return handleProxy(request, await params);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    return handleProxy(request, await params);
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    return handleProxy(request, await params);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    return handleProxy(request, await params);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    return handleProxy(request, await params);
}

async function handleProxy(request: Request, params: { slug: string[] }) {
    try {
      
        const origin = request.headers.get('origin');
        if (origin && process.env.NODE_ENV === 'production') {
            const host = request.headers.get('host') || '';
            let originHost = '';
            try {
                originHost = new URL(origin).host;
            } catch {
                originHost = '';
            }
            if (!host || originHost !== host) {
                return new NextResponse("Forbidden - CSRF attempt detected", { status: 403 });
            }
        }

        const { slug } = params;
        const path = slug.join("/");
        const url = new URL(path, BACKEND_URL);

        // Preserve search params
        const { searchParams } = new URL(request.url);
        searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        const headers = new Headers(request.headers);
        headers.delete("host"); // Remove host to prevent conflict

        // Bypass ngrok browser warning page
        headers.set('ngrok-skip-browser-warning', '798414');

        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
        if (ip) {
            headers.set('X-Forwarded-For', ip);
        }

        let body: any = undefined;
        if (!["GET", "HEAD"].includes(request.method)) {
            const tempBody = await request.arrayBuffer();
            if (tempBody.byteLength > 0) {
                body = tempBody;
            } else {
                // If there's no body, delete Content-Type to avoid backend parsing errors on empty POSTs
                headers.delete("content-type");
            }
        }

        // Translate the cookie token to the Authorization Bearer header for the backend
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(url.toString(), {
            method: request.method,
            headers: headers,
            body: body,
            cache: "no-store",
        });

        const resHeaders = new Headers(response.headers);
        resHeaders.delete("set-cookie");

        if (!resHeaders.has("Content-Type")) {
            resHeaders.set("Content-Type", "application/json");
        }

        const data = response.status === 204 ? null : await response.text();

        const nextResponse = new NextResponse(data, {
            status: response.status,
            headers: resHeaders,
        });

        const setCookies = response.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => {
                nextResponse.headers.append("Set-Cookie", cookie);
            });
        }

        // Extract userType and save it in a non-HttpOnly cookie so the middleware and frontend can access it easily
        if (data && response.status >= 200 && response.status < 300) {
            try {
                const parsed = JSON.parse(data);
                const userType = parsed?.userType || parsed?.user?.user_type || parsed?.user?.userType || parsed?.user_type;
                if (userType) {
                    nextResponse.headers.append(
                        "Set-Cookie",
                        `user_type=${userType}; Max-Age=604800; path=/; SameSite=Lax; Secure`
                    );
                }
            } catch (e) {
                // Ignore parsing errors for non-JSON responses
            }
        }

        // Force clear cookies on logout if they were not already cleared by a successful response
        if (path.endsWith("auth/logout")) {
            nextResponse.headers.append("Set-Cookie", "access_token=; Max-Age=0; path=/; SameSite=Lax; HttpOnly; Secure");
            nextResponse.headers.append("Set-Cookie", "refresh_token=; Max-Age=0; path=/; SameSite=Lax; HttpOnly; Secure");
            nextResponse.headers.append("Set-Cookie", "user_type=; Max-Age=0; path=/; SameSite=Lax; Secure");
        }

        return nextResponse;

    } catch (error: any) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
