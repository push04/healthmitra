import { PHRView } from "@/components/client/phr/PHRView";

export default async function PHRPage() {
    // MOCK DATA
    const MOCK_DOCUMENTS = [
        {
            id: "doc-1",
            title: "Annual Health Checkup Report",
            type: "report",
            user_id: "mock-user-123",
            date: "2024-01-20",
            file_url: "#",
            created_at: new Date().toISOString()
        },
        {
            id: "doc-2",
            title: "Vaccination Certificate",
            type: "certificate",
            user_id: "mock-user-123",
            date: "2023-06-15",
            file_url: "#",
            created_at: new Date().toISOString()
        }
    ];

    return <PHRView documents={MOCK_DOCUMENTS} />;
}
