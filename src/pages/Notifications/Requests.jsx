import React, { useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Notifications = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const currentUser = useSelector((store) => store.user);

  // Datos simulados de notificaciones basados en los matches (connections)
  const simulatedNotifications = connections.length > 0 ? connections.map((connection, index) => ({
    id: connection._id || `notif-${index}`,
    user: {
      firstName: connection.firstName,
      lastName: connection.lastName,
      photoUrl: connection.photoUrl || "https://via.placeholder.com/150",
      age: connection.age,
      gender: connection.gender,
      about: connection.about || "No bio provided.",
    },
    message: `Congratulations! You have matched with ${connection.firstName} ${connection.lastName}.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * Math.random() * 7).toISOString(), // Fecha aleatoria en los últimos 7 días
    unread: Math.random() > 0.5, // Simula si está leído o no
  })) : [
    // Si no hay conexiones, mostrar una notificación genérica
    {
      id: "notif-0",
      user: null,
      message: "You have no matches yet. Browse profiles to find matches!",
      timestamp: new Date().toISOString(),
      unread: true,
    },
  ];

  // Formato de fecha para las notificaciones
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago${diffMinutes !== 1 ? "" : ""}`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hours ago${hours !== 1 ? "" : ""}`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} days ago${days !== 1 ? "" : ""}`;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 bg-blue-800 min-h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <Sidebar />
      </div>

      {/* Notifications Section */}
      <div className="w-full pt-32 md:w-3/4 relative bg-blue-800">
        {simulatedNotifications.length > 0 ? (
          simulatedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-4xl mx-auto p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 mb-6 bg-white ${
                notification.unread ? "border-2 border-blue-500" : "border-2 border-gray-200"
              }`}
            >
              {notification.user ? (
                <>
                  {/* Imagen del usuario */}
                  <img
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg object-cover"
                    src={notification.user.photoUrl}
                  />

                  {/* Detalles de la notificación */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="font-bold text-xl text-gray-800">
                      {notification.user.firstName + " " + notification.user.lastName}
                    </h2>
                    <p className="text-green-600 mt-2">{notification.message}</p>
                    <p className="text-gray-500 mt-1">
                      {formatNotificationTime(notification.timestamp)}
                    </p>
                    {notification.user.age && notification.user.gender && (
                      <p className="text-gray-600 mt-1">
                        {notification.user.age} years, {notification.user.gender}
                      </p>
                    )}
                  </div>

                  {/* Acción */}
                  <div className="flex gap-4">
                    <Link
                      to="/messages"
                      onClick={() => localStorage.setItem("selectedChatUserId", notification.user._id)}
                      className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-600 transition duration-200 cursor-pointer"
                    >
                      Send message
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex-1 text-center text-gray-500">
                  <p>{notification.message}</p>
                  <p className="mt-2">{formatNotificationTime(notification.timestamp)}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;