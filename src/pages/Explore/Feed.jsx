import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import UserCard from "../../components/UserCard/UserCard";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { addFeed } from "../../utils/feedSlice";

const Feed = () => {
  const feed = useSelector((store) => store?.feed);
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0); // Índice del perfil actual

  const getFeed = async () => {
    try {
const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/') 
  ? import.meta.env.VITE_API_URL.slice(0, -1) 
  : import.meta.env.VITE_API_URL;

const res = await axios.get(`${baseUrl}/api/v1/feed`, { withCredentials: true });

      if (res?.data?.data) {
        const shuffledProfiles = res.data.data.sort(() => Math.random() - 0.5);
        dispatch(addFeed([...feed, ...shuffledProfiles])); // Agregar nuevos perfiles sin eliminar los anteriores
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (feed.length === 0) {
      getFeed();
    }
  }, []);

  useEffect(() => {
    if (feed.length - currentIndex < 3) {
      getFeed();
    }
  }, [currentIndex]);

  const handleNextProfile = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  if (feed.length === 0 || currentIndex >= feed.length) {
    return "No feed available";
  }

  return (
    <div className="flex gap-[45vw] bg-blue-800 min-h-screen">
      <div>
        <Sidebar />
      </div>

      <div className="mt-5">
        <UserCard key={feed[currentIndex].id} user={feed[currentIndex]} onNext={handleNextProfile} />
      </div>
    </div>
  );
};

export default Feed;
