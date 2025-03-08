import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { addConnections, removeConnection } from "../../utils/connectionSlice";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const currentUser = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/matches/user/${currentUser._id}`, {
          withCredentials: true,
        });
        
        console.log("Matches recibidos:", res.data);
        
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          if (res.data.data.length > 0) {
            console.log("Ejemplo de match:", res.data.data[0]);
          }
          
          dispatch(addConnections(res.data.data));
        } else {
          console.warn("Formato de respuesta inesperado:", res.data);
          dispatch(addConnections([]));
        }
      } catch (error) {
        console.error("Error al cargar matches:", error);
        dispatch(addConnections([]));
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchMatches();
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    console.log("Connections después de actualizar state:", connections);
  }, [connections]);

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        const response = await axios.delete(`${BASE_URL}/api/matches/${currentUser._id}/${matchId}`, {
          withCredentials: true,
        });
        
        if (response.data.success) {
          // Eliminar de Redux
          dispatch(removeConnection(matchId));
          
          // Eliminar la conversación del localStorage si existe
          const storageKey = `conversation_${currentUser._id}_${matchId}`;
          localStorage.removeItem(storageKey);
          
          // Mensaje de éxito
          alert("Match deleted successfully");
        } else {
          alert("Error deleting match: " + response.data.message);
        }
      } catch (error) {
        console.error("Error deleting match:", error);
        alert("Error deleting match. Please try again.");
      }
    }
  };

  return (
    <div className="flex w-full bg-blue-800 min-h-screen">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-15 mt-10 bg-transparent">
        <Sidebar />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-grow ml-80 py-10 px-8">
        {loading ? (
          <div className="text-white text-xl text-center mt-10">Cargando matches...</div>
        ) : !currentUser ? (
          <div className="text-white text-xl text-center mt-10">Por favor inicia sesión para ver tus matches</div>
        ) : !connections || connections.length === 0 ? (
          <div className="text-white text-xl text-center mt-10">No se encontraron matches</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {connections.map((match) => (
              <div key={match._id} className="flex justify-center">
                <div className="card w-full md:w-[20vw] h-[450px] md:h-[30vw] rounded-2xl shadow-2xl relative overflow-hidden bg-base-300">
                  <figure className="relative h-full w-full">
                    <img
                      className="w-full h-full object-cover object-center opacity-90"
                      src={match.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
                      alt="User"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://geographyandyou.com/images/user-profile.png";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-transparent to-transparent py-2 px-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-75 rounded-lg"></div>
                        {match.firstName && match.lastName && (
                          <h1 className="relative text-2xl w-full px-2 mt-2 font-bold text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]">
                            {match.firstName + " " + match.lastName}
                          </h1>
                        )}
                        <h3 className="relative text-sm px-2 mt-1 font-medium text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]">
                          {match.about}
                        </h3>
                        {match.age && match.gender && (
                          <h5 className="relative text-sm px-2 mt-1 flex justify-between font-medium text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]">
                            🎂{match.age} , 🧑‍🤝‍🧑{match.gender.toUpperCase()} 🕓 Active few hours ago
                          </h5>
                        )}
                        
                        {/* Botones de Chatear y Eliminar */}
                        <div className="relative px-2 mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              localStorage.setItem("selectedChatUserId", match._id);
                              navigate("/messages");
                            }}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-lg"
                          >
                            Chat
                          </button>
                          <button
                            onClick={() => handleDeleteMatch(match._id)}
                            className="bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </figure>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;