import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";

async function getMobileUser(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();

  try {
    return await verifyMobileToken(token);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getMobileUser(request);

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const address = await prisma.address.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      address,
    });
  } catch (error) {
    console.error(
      "Get saved address error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load saved address.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getMobileUser(request);

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const customerName =
      typeof body.customerName === "string"
        ? body.customerName.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    const city =
      typeof body.city === "string"
        ? body.city.trim()
        : "";

    const state =
      typeof body.state === "string"
        ? body.state.trim()
        : "";

    const country =
      typeof body.country === "string"
        ? body.country.trim()
        : "";

    if (
      !customerName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !country
    ) {
      return NextResponse.json(
        {
          error:
            "All delivery fields are required.",
        },
        { status: 400 }
      );
    }

    await prisma.address.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const savedAddress =
      await prisma.address.create({
        data: {
          userId: user.id,
          customerName,
          phone,
          address,
          city,
          state,
          country,
          isDefault: true,
        },
      });

    return NextResponse.json(
      {
        message:
          "Address saved successfully.",
        address: savedAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Save address error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to save address.",
      },
      { status: 500 }
    );
  }
}