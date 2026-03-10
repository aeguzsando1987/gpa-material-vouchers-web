import { NextRequest, NextResponse } from 'next/server';

// URL del backend - leída en tiempo de servidor (nunca expuesta al browser)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/${path}${search}`;

  // Copiar headers del request, omitiendo 'host' (Next.js lo maneja)
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers[key] = value;
    }
  });

  // Leer el body como texto para evitar problemas con ArrayBuffer/ReadableStream
  // en el fetch interno de Node.js (undici). Funciona para JSON y form-urlencoded.
  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const bodyText = hasBody ? await request.text() : undefined;

  // Hacer la petición al backend - redirect:'follow' sigue redirects server-side
  const response = await fetch(url, {
    method: request.method,
    headers,
    body: bodyText || undefined,
    redirect: 'follow',  // ← Clave: sigue el 307 internamente, browser nunca ve la URL HTTP
  });

  // Limpiar headers de respuesta que causarían problemas
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!['transfer-encoding', 'connection', 'keep-alive'].includes(lower)) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
