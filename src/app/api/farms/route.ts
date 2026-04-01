import { NextResponse } from "next/server";
import { FarmService } from "@/services/farmService";

export async function GET() {
  try {
    const farms = await FarmService.getAll();
    return NextResponse.json(farms);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.nombre || !body.superficie) {
      return new NextResponse("Missing fields", { status: 400 });
    }
    const farm = await FarmService.create(body);
    return NextResponse.json(farm);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
