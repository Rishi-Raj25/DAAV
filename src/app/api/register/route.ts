import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ message: "Use Razorpay checkout to create a DAAV." }, { status: 410 }); }
