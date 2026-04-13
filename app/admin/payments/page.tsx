// app/admin/payments/page.tsx
// Server component — just fetches data and passes to client
import { createClient } from "@supabase/supabase-js";
import PaymentsClient from "./PaymentsClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export default async function PaymentsPage() {
  const { data } = await supabaseAdmin
    .from("payment_transactions")
    .select("*")
    .order("created_at", { ascending: false });

  return <PaymentsClient initialPayments={data || []} />;
}
