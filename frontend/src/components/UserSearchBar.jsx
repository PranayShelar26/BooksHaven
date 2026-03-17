import { useUser } from "../context/UserContext";

const UserSearchBar = () => {
  const { search, setSearch } = useUser();

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      type="text"
      placeholder="Search users..."
      className="w-full pl-8 pr-8 py-4 rounded-2xl bg-white shadow-lg shadow-gray-100/50 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all"
    />
  );
};

export default UserSearchBar;