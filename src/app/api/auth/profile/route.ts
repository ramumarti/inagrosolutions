import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Get user profile/role
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: profile?.role || 'agricultor',
    metadata: user.user_metadata,
    profile
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { role, nombre } = await req.json();

  // Basic role update (if allowed in business logic)
  const { error } = await supabase
    .from('users')
    .update({ role, name: nombre })
    .eq('id', user.id);

  if (error) return new NextResponse(error.message, { status: 500 });

  return new NextResponse("Profile updated", { status: 200 });
}
