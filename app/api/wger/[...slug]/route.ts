import { NextResponse } from "next/server";

// Dedicated proxy for the public wger exercise/nutrition database.
// Separate from app/api/[...slug]/route.ts (which targets the GymSpot backend
// and is auth-aware): wger endpoints can be public or user-specific.
// For user-specific operations (nutrition plans, weight entries, etc.),
// we forward the Authorization header from the frontend to wger.de.

const WGER_BASE = (process.env.NEXT_PUBLIC_WGER_API_URL || "https://wger.de/api/v2")
    .replace(/\/+$/, "");

// Allow-list of wger endpoints we proxy. Prevents this route from becoming an
// open proxy / SSRF vector — only these path segments are forwarded.
const ALLOWED_ENDPOINTS = new Set([
    "exercise",
    "exerciseinfo",
    "exercisebaseinfo",
    "exercise-translation",
    "exercisecategory",
    "exerciseimage",
    "exercisecomment",
    "exercisealias",
    "muscle",
    "equipment",
    "video",
    "language",
    "license",
    "ingredient",
    "ingredientinfo",
    "ingredient-sync",
    "ingredientweightunit",
    "nutritionplan",
    "nutritionplaninfo",
    "nutritiondiary",
    "meal",
    "mealitem",
    "ingredient-image",
    "weightentry",
    "measurement",
    "measurement-category",
    "userprofile",
]);

// Taxonomy (categories/muscles/equipment) barely changes → cache hard.
// Exercise lists/details change more often → shorter revalidate.
const SLOW_ENDPOINTS = new Set(["exercisecategory", "muscle", "equipment", "language", "license"]);
const SLOW_REVALIDATE = 60 * 60 * 24; // 24h
const FAST_REVALIDATE = 60 * 60;      // 1h

async function handleProxy(
    request: Request,
    { params }: { params: Promise<{ slug: string[] }> },
) {
    try {
        const { slug } = await params;
        const endpoint = slug[0];

        if (!endpoint || !ALLOWED_ENDPOINTS.has(endpoint)) {
            return NextResponse.json(
                { message: `wger endpoint '${endpoint ?? ""}' is not allowed` },
                { status: 404 },
            );
        }

        // Preserve trailing slash (DRF is picky) and forward query params.
        let path = slug.join("/");
        if (new URL(request.url).pathname.endsWith("/") && !path.endsWith("/")) {
            path += "/";
        }
        const url = new URL(`${WGER_BASE}/${path}`);
        new URL(request.url).searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        // Always ask wger for JSON unless downloading binary/gzip files.
        if (!path.includes("ingredients.jsonl.gz")) {
            url.searchParams.set("format", "json");
        }

        const isGet = request.method === "GET";
        const revalidate = SLOW_ENDPOINTS.has(endpoint) ? SLOW_REVALIDATE : FAST_REVALIDATE;

        // Build headers. Forward Authorization header if provided.
        const headers: Record<string, string> = {
            Accept: "application/json",
        };

        const authHeader = request.headers.get("Authorization");
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        // Handle body payload for mutation requests
        let body: string | undefined = undefined;
        if (request.method !== "GET" && request.method !== "DELETE") {
            body = await request.text();
            const contentType = request.headers.get("Content-Type");
            if (contentType) {
                headers["Content-Type"] = contentType;
            }
        }

        const response = await fetch(url.toString(), {
            method: request.method,
            headers,
            body,
            // Next.js data cache only applies to GET requests
            ...(isGet ? { next: { revalidate } } : {}),
        });

        // Some endpoints (like delete) might return no content
        const data = await response.text();

        const responseHeaders: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (isGet) {
            responseHeaders["Cache-Control"] = `public, max-age=0, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`;
        }

        return new NextResponse(data, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("wger Proxy Error:", error);
        return NextResponse.json({ message: "Failed to reach wger" }, { status: 502 });
    }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
