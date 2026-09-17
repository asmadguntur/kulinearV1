import { useCurrentUser } from "@/hooks/useUsers";

export default function ProfilePage() {
  const { user, loading, error } = useCurrentUser();

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">Error: {error.message}</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6">
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
