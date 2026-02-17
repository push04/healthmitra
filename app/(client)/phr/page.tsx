import { PHRView } from "@/components/client/phr/PHRView";
import { getPHRDocuments } from "@/app/actions/phr";

export default async function PHRPage() {
    const { data } = await getPHRDocuments();

    return <PHRView documents={data || []} />;
}
