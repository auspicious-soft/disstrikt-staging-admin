import { NextResponse } from "next/server";
import { auth } from "@/auth";

const adminOnlyRoutes = [
  "/admin/user-management",
  "/admin/employee-management",
  "/admin/revenue",
  "/admin/subscription-plans",
  "/admin/dashboard"
  // add more admin-only routes here
];

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const session = await auth();

  // 🔹 If user is logged in and tries to access `/` (login page) → redirect away
  if (pathname === "/" && session?.user) {
    const role = session.user.role;
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/admin/review-tasks", request.url));
    }
  }

  // 🔹 Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    // If not logged in, block access
    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const role = session.user.role;

    // If employee tries to access admin-only route, redirect to dashboard
 if (
      role !== "ADMIN" &&
      adminOnlyRoutes.some(
        (route) =>
          pathname.startsWith(route) &&
          !pathname.startsWith("/admin/user-management/review-task/")
      )
    ) {
      return NextResponse.redirect(new URL("/admin/review-tasks", request.url));
    }
  }

  // ✅ Allow everything else
  return NextResponse.next();
}

// Apply middleware only to /admin routes
export const config = {
  matcher: ["/", "/admin/:path*"], // 👈 also apply middleware to `/`
};