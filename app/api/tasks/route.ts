import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      title,
      description,
      category,
      difficulty,
      budget,
      deadline,
      requirements,
    } = await req.json();

    if (!userId || !title || !description || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const task = await createTask({
      clientId: userId,
      title,
      description,
      category,
      difficulty: difficulty || "medium",
      budget,
      deadline: new Date(deadline),
      requirements,
      status: "open",
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");

    // ✅ If no filters, fetch directly from Supabase (for TaskMarketplace)
    if (!category && !difficulty && !status) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // ✅ Otherwise use listTasks with filters
    const tasks = await listTasks({
      category: category || undefined,
      difficulty: difficulty || undefined,
      status: status || "open",
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("Task listing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list tasks" },
      { status: 500 },
    );
  }
}
