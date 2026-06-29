import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Base URL for your actual backend
const NEXT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_WITH_PATH = NEXT_API_URL.endsWith("/api") ? NEXT_API_URL : `${NEXT_API_URL}/api`;
const BACKEND_URL = API_WITH_PATH.endsWith("/") ? API_WITH_PATH : `${API_WITH_PATH}/`;
const ACCESS_COOKIE_NAMES = ["access_token", "token"];

const getSetCookies = (response: Response): string[] => {
    return response.headers.getSetCookie?.() ?? [];
};

const cookieNameValue = (setCookie: string): [string, string] | null => {
    const firstPart = setCookie.split(";", 1)[0];
    const separatorIndex = firstPart.indexOf("=");
    if (separatorIndex <= 0) return null;
    return [
        firstPart.slice(0, separatorIndex).trim(),
        firstPart.slice(separatorIndex + 1).trim(),
    ];
};

const mergeSetCookiesIntoCookieHeader = (
    cookieHeader: string,
    setCookies: string[],
): string => {
    const jar = new Map<string, string>();

    cookieHeader.split(";").forEach((part) => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex <= 0) return;
        jar.set(
            trimmed.slice(0, separatorIndex).trim(),
            trimmed.slice(separatorIndex + 1).trim(),
        );
    });

    setCookies.forEach((setCookie) => {
        const parsed = cookieNameValue(setCookie);
        if (!parsed) return;
        const [name, value] = parsed;
        if (!value) jar.delete(name);
        else jar.set(name, value);
    });

    return Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
};

const getCookieFromHeader = (cookieHeader: string, names: string[]): string | null => {
    for (const part of cookieHeader.split(";")) {
        const trimmed = part.trim();
        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex <= 0) continue;
        const name = trimmed.slice(0, separatorIndex).trim();
        if (names.includes(name)) {
            return trimmed.slice(separatorIndex + 1).trim();
        }
    }
    return null;
};

const copySetCookies = (response: NextResponse, setCookies: string[]) => {
    setCookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
    });
};

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
        let path = slug.join("/");
        if (new URL(request.url).pathname.endsWith("/") && !path.endsWith("/")) {
            path += "/";
        }
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

        let body: BodyInit | undefined;
        if (!["GET", "HEAD"].includes(request.method)) {
            const tempBody = await request.arrayBuffer();
            if (tempBody.byteLength > 0) {
                body = tempBody;
            } else {
                // If there's no body, delete Content-Type to avoid backend parsing errors on empty POSTs
                headers.delete("content-type");
            }
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        let response = await fetch(url.toString(), {
            method: request.method,
            headers: headers,
            body: body,
            cache: "no-store",
        });
        let refreshSetCookies: string[] = [];

        const canAttemptRefresh =
            response.status === 401 &&
            !path.endsWith("auth/login") &&
            !path.endsWith("auth/token/refresh");

        if (canAttemptRefresh) {
            const refreshHeaders = new Headers(request.headers);
            refreshHeaders.delete("host");
            refreshHeaders.delete("content-type");
            refreshHeaders.delete("content-length");
            refreshHeaders.delete("authorization");
            refreshHeaders.set('ngrok-skip-browser-warning', '798414');

            const refreshUrl = new URL("auth/token/refresh", BACKEND_URL);
            const refreshResponse = await fetch(refreshUrl.toString(), {
                method: "POST",
                headers: refreshHeaders,
                cache: "no-store",
            });

            if (refreshResponse.ok) {
                refreshSetCookies = getSetCookies(refreshResponse);
                const nextCookieHeader = mergeSetCookiesIntoCookieHeader(
                    headers.get("cookie") ?? "",
                    refreshSetCookies,
                );
                if (nextCookieHeader) {
                    headers.set("cookie", nextCookieHeader);
                    const refreshedToken = getCookieFromHeader(nextCookieHeader, ACCESS_COOKIE_NAMES);
                    if (refreshedToken) {
                        headers.set("Authorization", `Bearer ${refreshedToken}`);
                    }
                }

                response = await fetch(url.toString(), {
                    method: request.method,
                    headers: headers,
                    body: body,
                    cache: "no-store",
                });
            }
        }

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

        copySetCookies(nextResponse, refreshSetCookies);
        copySetCookies(nextResponse, getSetCookies(response));

        // Extract userType and save it in a non-HttpOnly cookie so the middleware and frontend can access it easily
        if (data && response.status >= 200 && response.status < 300) {
            try {
                const parsed = JSON.parse(data);
                const userType = parsed?.userType || parsed?.user?.user_type || parsed?.user?.userType || parsed?.user_type;
                if (userType) {
                    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
                    nextResponse.headers.append(
                        "Set-Cookie",
                        `user_type=${userType}; Max-Age=604800; path=/; SameSite=Lax${secureFlag}`
                    );
                }
            } catch {
                // Ignore parsing errors for non-JSON responses
            }
        }

        // Force clear cookies on logout if they were not already cleared by a successful response
        if (path.endsWith("auth/logout")) {
            nextResponse.headers.append("Set-Cookie", "access_token=; Max-Age=0; path=/; SameSite=Lax; HttpOnly; Secure");
            nextResponse.headers.append("Set-Cookie", "refresh_token=; Max-Age=0; path=/; SameSite=Lax; HttpOnly; Secure");
            const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
            nextResponse.headers.append("Set-Cookie", `user_type=; Max-Age=0; path=/; SameSite=Lax${secureFlag}`);
        }

        return nextResponse;

    } catch (error: unknown) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
