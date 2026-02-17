import { getUserInvoices } from "@/app/actions/user";
import { InvoicesView } from "@/components/client/InvoicesView";

export default async function InvoicesPage() {
    const { success, data } = await getUserInvoices();

    // Map created_at to date for compatibility

    const invoices = (data || []).map((inv: any) => ({
        ...inv,
        date: inv.created_at, // Map created_at to date
        // Ensure other fields match or are present
    }));

    return <InvoicesView invoices={invoices} />;
}
