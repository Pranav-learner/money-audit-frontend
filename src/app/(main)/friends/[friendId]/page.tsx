import { FriendProfilePage } from '@/features/friends/friend-profile-page';

export default async function Page({ params }: { params: Promise<{ friendId: string }> }) {
  const { friendId } = await params;
  return <FriendProfilePage friendId={friendId} />;
}
