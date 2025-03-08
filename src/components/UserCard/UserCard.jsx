import { BASE_URL } from "../../utils/constants";
import axios from "axios";
import { removeFeed } from "../../utils/feedSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const UserCard = ({ user, onNext }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((store) => store.user);

  const [showMatchPopup, setShowMatchPopup] = useState(false);

  if (!currentUser) {
    console.warn("Advertencia: currentUser no está definido");
    return null;
  }

  const handleSendConnectionRequest = async (status, userId) => {
    if (status === "interested") {
      console.log("Enviando solicitud de match para:", userId);
  
      try {
        const res = await axios.post(
          `${BASE_URL}/api/matches/like`,
          {
            userId: currentUser._id,
            likedUserId: userId,
          },
          { withCredentials: true }
        );
  
        console.log("Respuesta de la API:", res.data);
  
        if (res.data.success) {
          setShowMatchPopup(true); // Mostrar pop-up al dar like exitoso
          setTimeout(() => {
            setShowMatchPopup(false); // Ocultar después de 2 segundos
            dispatch(removeFeed(userId));
            onNext();
          }, 2000);
        } else {
          dispatch(removeFeed(userId));
          onNext();
        }
      } catch (error) {
        console.error("Error al enviar like:", error);
        dispatch(removeFeed(userId));
        onNext();
      }
    } else {
      dispatch(removeFeed(userId));
      onNext();
    }
  };

  return user && (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card w-screen bottom-0 md:w-[25vw] h-screen md:h-[38vw] rounded-2xl shadow-2xl relative overflow-hidden bg-base-300">
        <figure className="relative h-screen w-screen md:w-full md:h-full">
          <img className="w-full h-full object-cover object-center opacity-90" src={user.photoUrl} alt="User" />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-transparent to-transparent py-2 px-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-75 rounded-lg"></div>
              {user.firstName && user.lastName && (
                <h1 className="relative text-3xl w-full px-2 mt-2 font-bold text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]">
                  {user.firstName + " " + user.lastName}
                </h1>
              )}
              <h3 className="relative text-sm px-2 mt-1 font-medium text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]">
                {user.about}
              </h3>
              {user.age && user.gender && (
                <h5 className="relative text-sm px-2 mt-1 flex justify-between font-medium text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]">
                  🎂{user.age} , 🧑‍🤝‍🧑{user.gender.toUpperCase()} 🕓 Active few hours ago
                </h5>
              )}
            </div>
          </div>

          {/* Botón de rechazo ❌ */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
            <div 
              onClick={() => handleSendConnectionRequest('ignored', user._id)} 
              className="text-center cursor-pointer flex items-center justify-center w-16 h-16 text-3xl text-black rounded-full bg-white shadow-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] hover:scale-110 transition-transform"
            >
              ❌
            </div>
          </div>

          {/* Botón de Like 💙 */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <div 
              onClick={() => handleSendConnectionRequest('interested', user._id)} 
              className="text-center cursor-pointer flex items-center justify-center w-16 h-16 text-3xl text-black rounded-full bg-white shadow-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] hover:scale-110 transition-transform"
            >
              💙
            </div>
          </div>

        </figure>

        {/* Pop-up de "It's a Match!" */}
        {showMatchPopup && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-3xl font-bold text-blue-800">It's a Match! 🎉</h2>
              <p className="mt-2 text-gray-600">You have connected with {user.firstName}!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;