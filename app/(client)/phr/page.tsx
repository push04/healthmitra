import { PHRView } from "@/components/client/phr/PHRView";

export default async function PHRPage() {
    // MOCK DATA with Prescription and Bills categories
    const MOCK_DOCUMENTS = [
        // Prescriptions
        {
            id: "doc-1",
            name: "Dr. Sharma - BP Medicines",
            category: "Prescriptions",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
        },
        {
            id: "doc-2",
            name: "Dr. Patel - Diabetes Prescription",
            category: "Prescriptions",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
        },
        {
            id: "doc-3",
            name: "General Checkup Prescription",
            category: "Prescriptions",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
        },
        // Bills
        {
            id: "doc-4",
            name: "Apollo Pharmacy - Medicine Bill",
            category: "Bills",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            amount: 1250
        },
        {
            id: "doc-5",
            name: "SRL Diagnostics - CBC Test Bill",
            category: "Bills",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            amount: 800
        },
        {
            id: "doc-6",
            name: "Max Hospital - OPD Consultation Bill",
            category: "Bills",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            amount: 1500
        },
        // Reports
        {
            id: "doc-7",
            name: "Annual Health Checkup Report",
            category: "Reports",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
        },
        {
            id: "doc-8",
            name: "Blood Test Results - Lipid Profile",
            category: "Reports",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
        },
        // Certificates
        {
            id: "doc-9",
            name: "COVID-19 Vaccination Certificate",
            category: "Certificates",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
        },
        // Insurance
        {
            id: "doc-10",
            name: "Health Insurance Policy Document",
            category: "Insurance",
            user_id: "mock-user-123",
            uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
            file_url: "#",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
        }
    ];

    return <PHRView documents={MOCK_DOCUMENTS} />;
}
