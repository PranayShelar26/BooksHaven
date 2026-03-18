import React, { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "../components/Spinner";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import UserSearchBar from "../components/UserSearchBar";
import { useUser } from "../context/UserContext";
import api from "../lib/apiClient";

/**
 * AdminManageUsers - Admin dashboard for managing users (CRUD operations)
 */
const AdminManageUsers = () => {
  const { users, setUsers, loading, search } = useUser();

  const [activeStatus, setActiveStatus] = useState("All");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    title: "",
    description: "",
    newUser: null,
    isDangerous: false,
  });

  const [deleteUserId, setDeleteUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users/");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Error fetching users. Please try again.");
      setUsers([]);
    }
  }, [setUsers]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const statuses = useMemo(() => {
    const statusSet = new Set((users || []).map((u) => u.status).filter(Boolean));
    return ["All", ...Array.from(statusSet)];
  }, [users]);

  // Filter users by status and search
  useEffect(() => {
    let filtered =
      activeStatus === "All"
        ? users
        : users.filter((user) => user.status === activeStatus);

    const q = (search || "").toLowerCase();

    filtered = filtered.filter((user) => {
      const username = (user.username || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const membership = (user.membership || "").toLowerCase();
      return username.includes(q) || email.includes(q) || membership.includes(q);
    });

    setFilteredUsers(filtered);
  }, [activeStatus, users, search]);

  const handleAddUser = async (formData) => {
    try {
      const res = await api.post("/admin/users/create/", formData);

      if (res.data?.ok) {
        setConfirmationData({
          title: "User Created Successfully ✓",
          description: `User "${formData.username}" has been added to the system.`,
          newUser: formData,
          isDangerous: false,
        });
        setShowConfirmation(true);
        setIsModalOpen(false);

        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        alert("Error: " + (res.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Error adding user. Please try again.");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (formData) => {
    if (!selectedUser?.id) return;

    try {
      const res = await api.put(`/admin/users/${selectedUser.id}/`, formData);

      if (res.data?.ok) {
        setConfirmationData({
          title: "User Updated Successfully ✓",
          description: `User "${formData.username}" has been updated.`,
          newUser: formData,
          isDangerous: false,
        });
        setShowConfirmation(true);
        setIsEditModalOpen(false);

        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        alert("Error: " + (res.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user. Please try again.");
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteUserId(user.id);
    setConfirmationData({
      title: "Delete User?",
      description: `Are you sure you want to delete "${user.username}"? This action cannot be undone.`,
      newUser: null,
      isDangerous: true,
    });
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      const res = await api.delete(`/admin/users/${deleteUserId}/`);

      if (res.data?.ok) {
        setShowConfirmation(false);
        setDeleteUserId(null);

        setTimeout(() => {
          fetchUsers();
        }, 300);
      } else {
        alert("Error: " + (res.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user. Please try again.");
    }
  };

  if (loading || !users || users.length === 0) {
    return <Spinner />;
  }

  return (
    <>
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSubmit={handleEditUser}
      />

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setDeleteUserId(null);
        }}
        onConfirm={deleteUserId ? handleConfirmDelete : () => setShowConfirmation(false)}
        title={confirmationData.title}
        description={confirmationData.description}
        confirmText={deleteUserId ? "Delete" : "Done"}
        cancelText={deleteUserId ? "Cancel" : undefined}
        isDangerous={confirmationData.isDangerous}
      />

      <div className="mt-6 sm:mt-8 flex flex-col space-y-6 sm:space-y-8 mx-auto px-4 sm:px-6 md:px-8 lg:mx-20 my-5 max-w-full">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="font-bold text-2xl sm:text-3xl">Manage Users</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage users</p>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <UserSearchBar />
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
              aria-label="Add new user"
            >
              + Add New User
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2" role="tablist" aria-label="Filter users by status">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(status)}
                  className={`py-2 px-3 sm:px-5 rounded-xl font-semibold cursor-pointer transition-all whitespace-nowrap text-xs sm:text-sm
                    ${
                      activeStatus === status
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 hover:bg-amber-400 hover:text-white"
                    }`}
                  aria-pressed={activeStatus === status}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table & Card View */}
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">User</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Contact</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Membership</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Books</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 lg:px-6 py-3 font-semibold text-sm">{user.username}</td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 text-sm">{user.membership}</td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 text-sm">
                      <div>Current: {user.books?.current ?? 0}</div>
                      <div>Total: {user.books?.total ?? 0}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                          aria-label={`Edit user ${user.username}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(user)}
                          className="px-3 py-1 text-xs font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          aria-label={`Delete user ${user.username}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-all space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {user.username}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Membership</p>
                    <p className="font-medium">{user.membership}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Books</p>
                    <p className="font-medium">
                      {(user.books?.current ?? 0)}/{(user.books?.total ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(user)}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                    aria-label={`Edit user ${user.username}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(user)}
                    className="flex-1 px-3 py-2 text-xs font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    aria-label={`Delete user ${user.username}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminManageUsers;