import { getSupportTickets } from "@/app/actions/support";
import SupportClient from "./SupportClient";

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
    const { data: tickets } = await getSupportTickets();

    return <SupportClient initialTickets={tickets || []} />;
}
