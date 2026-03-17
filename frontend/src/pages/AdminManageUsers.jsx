import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import Spinner from "../components/Spinner";
import UserStatus from "../components/UserStatus";
import { useUser } from "../context/UserContext";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import UserSearchBar from "../components/UserSearchBar";

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:8000/api/admin/users/", { withCredentials: true })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        alert(err);
      });
  };

  const statuses = ["All", ...new Set(users.map((user) => user.status))];

  // Filter users by status and search
  useEffect(() => {
    let filtered =
      activeStatus === "All"
        ? users
        : users.filter((user) => user.status === activeStatus);

    // Apply search filter
    filtered = filtered.filter(
      (user) =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.membership.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredUsers(filtered);
  }, [activeStatus, users, search]);

  const handleAddUser = (formData) => {
    axios
      .post("http://localhost:8000/api/admin/users/create/", formData, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.ok) {
          // Show confirmation dialog with user details
          setConfirmationData({
            title: "User Created Successfully ✓",
            description: `User "${formData.username}" has been added to the system.`,
            newUser: formData,
            isDangerous: false,
          });
          setShowConfirmation(true);
          setIsModalOpen(false);

          // Refresh users list after a short delay
          setTimeout(() => {
            fetchUsers();
          }, 500);
        } else {
          alert("Error: " + res.data.message);
        }
      })
      .catch((err) => alert("Error adding user: " + err));
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditUser = (formData) => {
    axios
      .put(`http://localhost:8000/api/admin/users/${selectedUser.id}/`, formData, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.ok) {
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
          alert("Error: " + res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error updating user:", err);
        alert("Error updating user: " + err);
      });
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

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      axios
        .delete(`http://localhost:8000/api/admin/users/${deleteUserId}/`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.ok) {
            setShowConfirmation(false);
            setDeleteUserId(null);
            setTimeout(() => {
              fetchUsers();
            }, 300);
          } else {
            alert("Error: " + res.data.message);
          }
        })
        .catch((err) => {
          console.error("Error deleting user:", err);
          alert("Error deleting user: " + err);
        });
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
        {/* Header Section */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="font-bold text-2xl sm:text-3xl">Manage Users</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage users</p>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          {/* Search Bar and Add Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <UserSearchBar />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
            >
              + Add New User
            </button>
          </div>

          {/* Status Filter Buttons */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`py-2 px-3 sm:px-5 rounded-xl font-semibold cursor-pointer transition-all whitespace-nowrap text-xs sm:text-sm
                    ${
                      activeStatus === status
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 hover:bg-amber-400 hover:text-white"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section - Responsive Design */}
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">
                    User
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">
                    Contact
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">
                    Membership
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">
                    Books
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">
                    Actions
                  </th>
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
                      <div>Current: {user.books.current}</div>
                      <div>Total: {user.books.total}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
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
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="px-3 py-1 text-xs font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
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
                {/* Username and Status */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {user.username}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                      ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {user.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Membership</p>
                    <p className="font-medium">{user.membership}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Books</p>
                    <p className="font-medium">
                      {user.books.current}/{user.books.total}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="flex-1 px-3 py-2 text-xs font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
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