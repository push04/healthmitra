import { getUserProfile } from "@/app/actions/user";
import ProfileView from "@/components/client/ProfileView";

export default async function ProfilePage() {
    const { success, data } = await getUserProfile();

    // Fallback to minimal profile if fetch fails or map appropriately
    // The ProfileView likely handles partial data or we map usage

    return <ProfileView profile={data || {}} />;
}
