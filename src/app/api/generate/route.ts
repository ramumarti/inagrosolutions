import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGemini } from '@/lib/gemini';
import { buildPrompt } from '@/lib/prompts';

export async function POST(req: Request) {
  try {
    const { appSlug, inputs } = await req.json();

    if (!appSlug || !inputs) {
      return NextResponse.json({ error: 'Missing appSlug or inputs' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get App ID and template
    const { data: appData, error: appError } = await supabase
      .from('micro_apps')
      .select('id, prompt_template')
      .eq('slug', appSlug)
      .single();

    if (appError || !appData) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Insert pending execution
    const { data: executionData, error: executionError } = await supabase
      .from('app_executions')
      .insert({
        user_id: user.id,
        app_id: appData.id,
        inputs,
        status: 'pending'
      })
      .select('id')
      .single();

    if (executionError || !executionData) {
      return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 });
    }

    const executionId = executionData.id;

    // Background processing decoupled from the HTTP response
    after(async () => {
      try {
        const prompt = buildPrompt(appData.prompt_template, inputs);
        
        let resultMarkdown = "";
        let finalStatus = "completed";
        let errorMsg = null;

        try {
          // Update status to processing via server client (needs new instance inside after)
          const backgroundSupabase = await createClient();
          await backgroundSupabase
            .from('app_executions')
            .update({ status: 'processing' })
            .eq('id', executionId);

          resultMarkdown = await callGemini(prompt);
        } catch (geminiError: any) {
          finalStatus = "error";
          errorMsg = geminiError.message || "Unknown Gemini API Error";
        }

        // Final update
        const backgroundSupabaseFinal = await createClient();
        await backgroundSupabaseFinal
          .from('app_executions')
          .update({
            status: finalStatus,
            result: finalStatus === 'completed' ? { markdown: resultMarkdown } : null,
            error_message: errorMsg,
            completed_at: new Date().toISOString()
          })
          .eq('id', executionId);

      } catch (fatalError) {
        // Prevent crashing the Next.js process if supabase outer update fails
        console.error("Fatal error in background after() processing:", fatalError);
      }
    });

    return NextResponse.json({ executionId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
