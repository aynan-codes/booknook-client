import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  try {
    const { path } = await context.params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL is not configured." },
        { status: 500 }
      );
    }

    const targetUrl = new URL(
      `/api/${path.map(encodeURIComponent).join("/")}`,
      backendUrl
    );
    targetUrl.search = request.nextUrl.search;

    const headers = new Headers();
    const cookie = request.headers.get("cookie");
    const contentType = request.headers.get("content-type");

    if (cookie) headers.set("cookie", cookie);
    if (contentType) headers.set("content-type", contentType);

    const method = request.method;
    const response = await fetch(targetUrl, {
      method,
      headers,
      body: method === "GET" || method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");

    if (responseContentType) {
      responseHeaders.set("content-type", responseContentType);
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Could not connect to the backend." },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
