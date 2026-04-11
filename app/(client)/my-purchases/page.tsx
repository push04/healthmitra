import { MyPurchasesView } from "@/components/client/MyPurchasesView";
import { getMyPurchases } from "@/app/actions/ecards";

export const dynamic = 'force-dynamic';

export default async function MyPurchasesPage() {
    const { data: purchases } = await getMyPurchases();

    return <MyPurchasesView purchases={purchases || []} />;
}
