import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  // Allow all auth pages to load without token validation
  if (isAuthPage) {
    return NextResponse.next()
  }

  // For now, allow access to all protected routes
  // This will be handled by client-side authentication checks
  return NextResponse.next()
}

export const config = {
  matcher: ["/driver/:path*", "/manager/:path*", "/auth/:path*"],
}
