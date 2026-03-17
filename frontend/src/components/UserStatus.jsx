import React, { useState } from 'react'
import { useUser } from '../context/UserContext';

const UserStatus = () => {
    const { users } = useUser();
    const [activeStatus, setActiveStatus] = useState("All");

    const status = ["All", ...new Set(users.map((user) => user.status))];

    const handleCategory = (status) => {
        setActiveStatus(status);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {status.map((statusItem) => (
                <button
                    key={statusItem}
                    onClick={() => handleCategory(statusItem)}
                    className={`py-2 px-5 rounded-xl font-semibold cursor-pointer transition-all
                        ${activeStatus === statusItem
                            ? "bg-amber-500 text-white"
                            : "bg-gray-200 hover:bg-amber-400 hover:text-white"
                        }`}
                >
                    {statusItem}
                </button>
            ))}
        </div>
    );
};

export default UserStatus;