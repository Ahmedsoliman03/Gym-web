import { NextResponse } from "next/server";

// Base URL for your actual backend
const NEXT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    return handleProxy(request, await params);
}

async function handleProxy(request: Request, params: { slug: string[] }) {
    try {
        // حماية إضافية (CSRF Protection): التأكد أن الطلب قادم من الموقع الخاص بك
        const origin = request.headers.get('origin');
        if (origin && process.env.NODE_ENV === 'production') {
            const host = request.headers.get('host') || '';
            if (!origin.includes(host)) {
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

        // تمرير عنوان الـ IP الحقيقي للمستخدم للباك إند (لأغراض الأمان مثل Rate Limiting)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
        if (ip) {
            headers.set('X-Forwarded-For', ip);
        }

        let body = null;
        if (!["GET", "HEAD"].includes(request.method)) {
            const rawBody = await request.clone().text();
            if (rawBody) body = rawBody;
        }

        const response = await fetch(url.toString(), {
            method: request.method,
            headers: headers,
            body: body,
            cache: "no-store",
            credentials: "include",
        });

        // قراءة الـ Headers القادمة من الباك إند
        const resHeaders = new Headers(response.headers);

        // إزالة Set-Cookie من الـ Headers العادية لمنع دمجها بشكل خاطئ
        resHeaders.delete("set-cookie");

        if (!resHeaders.has("Content-Type")) {
            resHeaders.set("Content-Type", "application/json");
        }

        const data = await response.text();

        // تجهيز الـ Response الخاص بـ Next.js
        const nextResponse = new NextResponse(data, {
            status: response.status,
            headers: resHeaders,
        });

        // المعالجة الصحيحة والآمنة لتمرير الـ Cookies إلى المتصفح عبر HttpOnly
        const setCookies = response.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => {
                nextResponse.headers.append("Set-Cookie", cookie);
            });
        }

        return nextResponse;

    } catch (error: any) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
