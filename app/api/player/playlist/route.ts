export const dynamic = 'force-dynamic';
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);
    const screenId = searchParams.get("screen");

    if (!screenId) {
      return Response.json(
        { error: "screen required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ------------------------------------------------
    // SCREEN
    // ------------------------------------------------

    const { data: screen, error: screenError } = await supabase
      .from("screens")
      .select("playlist_id")
      .eq("id", screenId)
      .maybeSingle();

    if (screenError) {
      throw new Error(screenError.message);
    }

    if (!screen?.playlist_id) {

      return Response.json({
        items: []
      });

    }

    // ------------------------------------------------
    // PLAYLIST ITEMS
    // ------------------------------------------------

    const { data: items, error } = await supabase
      .from("playlist_items")
      .select("*")
      .eq("playlist_id", screen.playlist_id)
      .order("position", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      items: items ?? []
    });

  } catch (err: any) {

    console.error("PLAYER PLAYLIST ERROR:", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }

}
