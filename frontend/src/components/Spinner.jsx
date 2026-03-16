import React from "react";

const Spinner = () => {
  return (
    <div className="fixed inset-0 flex flex-col gap-5 items-center justify-center bg-white/70 backdrop-blur-sm z-40">
      <div
        className="h-12 w-12 animate-spin rounded-full border-6 border-amber-500 border-t-transparent"
        role="status"
      >
        
        <span className="sr-only">Loading...</span>
      </div>
      <div className="text-xl">
        Loading...
      </div>
    </div>
  );
};

export default Spinner; 