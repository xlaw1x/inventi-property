import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const session = request.cookies.get("pm_session")

  // Allow public announcements view
  if (pathname === "/announcements" && searchParams.get("view") === "public") {
    return NextResponse.next()
  }

  // Allow login page
  if (pathname === "/login") {
    return NextResponse.next()
  }

  // Redirect to login if no session
  if (!session || session.value !== "1") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
