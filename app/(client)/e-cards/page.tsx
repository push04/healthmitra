import { ECardsView } from "../../../components/client/e-cards/ECardsView";
import { getECards, getAvailableMembers } from "@/app/actions/ecards";

export const dynamic = 'force-dynamic';

export default async function ECardsPage() {
    const { data: cards } = await getECards();
    const members = await getAvailableMembers();

    return <ECardsView initialCards={cards || []} availableMembers={members} />;
}
