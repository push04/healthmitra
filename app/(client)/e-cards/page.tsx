import { ECardsView } from "../../../components/client/e-cards/ECardsView";

export const dynamic = 'force-dynamic';

export default async function ECardsPage() {
    // MOCK DATA
    const MOCK_CARDS = [
        {
            id: "card-1",
            user_id: "mock-user-123",
            card_number: "HEALTH-2024-001",
            member_name: "Test User",
            relation: "Self",
            dob: "1990-01-01",
            gender: "male",
            valid_from: "2024-01-01",
            valid_till: "2025-01-01",
            status: "active",
            plan_name: "Gold Family Protection",
            coverage_amount: 500000,
            emergency_contact: "+91 1800 123 4567"
        },
        {
            id: "card-2",
            user_id: "mock-user-123",
            card_number: "HEALTH-2024-002",
            member_name: "Spouse User",
            relation: "Spouse",
            dob: "1992-05-15",
            gender: "female",
            valid_from: "2024-01-01",
            valid_till: "2025-01-01",
            status: "active",
            plan_name: "Gold Family Protection",
            coverage_amount: 500000,
            emergency_contact: "+91 1800 123 4567"
        }
    ];

    const MOCK_MEMBERS = [{
        id: "mock-user-123",
        name: 'Test User',
        relation: 'Self',
        dob: "1990-01-01",
        gender: "male",
        hasCard: true
    }];

    return <ECardsView initialCards={MOCK_CARDS} availableMembers={MOCK_MEMBERS} />;
}
