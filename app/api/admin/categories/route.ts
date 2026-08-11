import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "You must be logged in.",
      },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "You are not authorized.",
      },
      { status: 403 }
    );
  }

  try {
    const categories =
      await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
        },
      });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error(
      "Admin categories error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load categories.",
      },
      { status: 500 }
    );
  }
}