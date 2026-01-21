import ProfileView from "@/components/client/ProfileView";

// MOCK DATA for Demo
const MOCK_PROFILE = {
    id: "mock-user-123",
    full_name: "Test User",
    email: "test@example.com",
    phone: "+91 98765 43210",
    dob: "1990-01-01",
    gender: "male",
    address: "123, Health Street, Care City",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

export default async function ProfilePage() {
    // Return mock data directly
    return <ProfileView profile={MOCK_PROFILE} />;
}
