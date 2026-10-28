import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ message: "Use the Razorpay checkout flow to create a DAAV." }, { status: 410 }); }
