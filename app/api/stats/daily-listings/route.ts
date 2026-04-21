import { NextRequest, NextResponse } from "next/server";
import { db } from "@shared/db";
import { listings } from "@shared/schemas";
import { count, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count listings created today
    const result = await db
      .select({ count: count() })
      .from(listings)
      .where(gte(listings.createdAt, today));

    const dailyCount = result[0]?.count || 0;

    return NextResponse.json({ 
      count: Number(dailyCount),
      success: true 
    });
  } catch (error) {
    console.error("Error fetching daily listings count:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily listings count", success: false },
      { status: 500 }
    );
  }
}
