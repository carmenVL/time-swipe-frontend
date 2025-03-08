import React from "react";
import Feed from "../../pages/Explore/Feed";
import Sidebar from "../Sidebar/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex bg-blue-800">
      <div>
        <Sidebar />
      </div>

      <div>
        <Feed />
      </div>
    </div>
  );
};

export default Dashboard;
