import { NextRequest, NextResponse } from "next/server";
import { db } from "@shared/db";
import { listings } from "@shared/schemas";
import { count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Count all listings (both active and inactive)
    const result = await db
      .select({ count: count() })
      .from(listings);

    const totalCount = result[0]?.count || 0;

    return NextResponse.json({ 
      count: Number(totalCount),
      success: true 
    });
  } catch (error) {
    console.error("Error fetching listings count:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings count", success: false },
      { status: 500 }
    );
  }
}
