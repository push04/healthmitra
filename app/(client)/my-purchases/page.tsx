import { MyPurchasesView } from "@/components/client/MyPurchasesView";
import { getMyPurchases } from "@/app/actions/ecards";

export default async function MyPurchasesPage() {
    const { data: purchases } = await getMyPurchases();

    return <MyPurchasesView purchases={purchases || []} />;
}
