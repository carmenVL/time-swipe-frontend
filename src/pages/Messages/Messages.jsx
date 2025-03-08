import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { removeConnection } from "../../utils/connectionSlice";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const currentUser = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Cargar las conversaciones del usuario
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUser?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Aquí normalmente harías una llamada a tu API
        // Simulando datos para el ejemplo
        const mockConversations = connections.map(connection => {
          // Verificamos si hay conversaciones guardadas en localStorage
          const storageKey = `conversation_${currentUser._id}_${connection._id}`;
          const savedMessages = JSON.parse(localStorage.getItem(storageKey)) || [];
          
          // Si no hay mensajes guardados, agregamos algunos de ejemplo
          const initialMessages = savedMessages.length > 0 ? savedMessages : [
            {
              id: 1,
              senderId: connection._id,
              text: `Hi! Glad to connect with you 😊`,
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * Math.random() * 7).toISOString()
            }
          ];
          
          // Calculamos el último mensaje para mostrarlo en la lista
          const lastMessage = initialMessages[initialMessages.length - 1];
          
          return {
            id: connection._id,
            user: connection,
            lastMessage: lastMessage.text,
            timestamp: lastMessage.timestamp,
            unread: Math.floor(Math.random() * 3), // Simulación de mensajes no leídos
            messages: initialMessages
          };
        });
        
        setConversations(mockConversations);
        
        // Verificar si hay un chat seleccionado en localStorage
        const selectedChatId = localStorage.getItem("selectedChatUserId");
        if (selectedChatId) {
          const chat = mockConversations.find(c => c.id === selectedChatId);
          if (chat) {
            selectChat(chat);
            // Limpiar después de usarlo
            localStorage.removeItem("selectedChatUserId");
          }
        }
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUser, connections]);

  // Función para seleccionar un chat
  const selectChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages);
    // No activamos el scroll automático cuando seleccionamos un chat
    setShouldScrollToBottom(false);
  };

  // Scroll al último mensaje solo cuando enviamos o recibimos uno nuevo
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);

  // Función para enviar un mensaje
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    // Activamos el scroll automático al enviar un mensaje
    setShouldScrollToBottom(true);
    
    const message = {
      id: Date.now(),
      senderId: currentUser._id,
      text: newMessage,
      timestamp: new Date().toISOString()
    };
    
    // Actualizar mensajes locales
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    
    // Actualizar la conversación en la lista
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedChat.id 
          ? { 
              ...conv, 
              lastMessage: message.text, 
              timestamp: message.timestamp,
              messages: updatedMessages 
            }
          : conv
      )
    );
    
    // Guardar en localStorage para persistencia
    const storageKey = `conversation_${currentUser._id}_${selectedChat.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
    
    setNewMessage("");
    
    // Simular respuesta después de 1-3 segundos
    setTimeout(() => {
      // Activamos el scroll automático para la respuesta
      setShouldScrollToBottom(true);
      
      const responses = [
        "How interesting! Tell me more about that.",
        "I love that idea. How long have you been doing this?",
        "Wow! I've never thought about it like that before.",
        "Would you like to meet up sometime to talk about this in person?",
        "We agree on a lot of things, I'm glad I met you!"
      ];
      
      const responseMessage = {
        id: Date.now(),
        senderId: selectedChat.id,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
      
      const newUpdatedMessages = [...updatedMessages, responseMessage];
      setMessages(newUpdatedMessages);
      
      // Actualizar conversación y localStorage
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedChat.id 
            ? { 
                ...conv, 
                lastMessage: responseMessage.text, 
                timestamp: responseMessage.timestamp,
                messages: newUpdatedMessages 
              }
            : conv
        )
      );
      
      localStorage.setItem(storageKey, JSON.stringify(newUpdatedMessages));
    }, 1000 + Math.random() * 2000);
  };

  // Función para eliminar un match/conversación
  const deleteConversation = async (chatId) => {
    // Confirmar antes de eliminar
    if (window.confirm("Are you sure you want to delete this conversation and the match with this user?")) {
      try {
        // Eliminar el match de la base de datos
        const response = await axios.delete(`${BASE_URL}/api/matches/${currentUser._id}/${chatId}`, {
          withCredentials: true,
        });
        
        // Eliminar de localStorage
        const storageKey = `conversation_${currentUser._id}_${chatId}`;
        localStorage.removeItem(storageKey);
        
        // Actualizar estado local
        setConversations(prev => prev.filter(conv => conv.id !== chatId));
        
        if (selectedChat && selectedChat.id === chatId) {
          setSelectedChat(null);
          setMessages([]);
        }
        
        // Eliminar también de las conexiones en Redux
        dispatch(removeConnection(chatId));
        
        // Mensaje de éxito - siempre mostrar éxito si llegamos hasta aquí 
        // ya que los estados locales se actualizaron correctamente
        alert("Match and conversation deleted successfully");
        
      } catch (error) {
        console.error("Error deleting match:", error);
        alert("Error deleting match. Please try again.");
      }
    }
  };

  // Formato de fecha/hora para los mensajes
  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Formato de fecha para la lista de conversaciones
  const formatConversationDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatMessageTime(timestamp);
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return (
    // Wrap the entire content in a div with full height and blue background
    <div className="flex flex-col min-h-screen bg-blue-800 pb-32">
      {/* Main content container with flexible height */}
      <div className="flex flex-1">
        {/* Sidebar as a fixed component */}
        <div className="sticky top-0 h-screen z-10 mt-8">
          <Sidebar />
        </div>
        
        {/* Main content area */}
        <div className="flex-grow ml-80 pt-32 px-8">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden flex h-[80vh]">
            {/* Lista de conversaciones */}
            <div className="w-1/3 border-r border-gray-300 overflow-y-auto">
              <div className="p-4 bg-blue-700">
                <h2 className="text-xl font-bold text-white">Messages</h2>
              </div>
              
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading conversations...</div>
              ) : !currentUser ? (
                <div className="p-4 text-center text-gray-500">Please log in to view your messages</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">You don't have conversations yet</div>
              ) : (
                <div>
                  {conversations.map((chat) => (
                    <div 
                      key={chat.id} 
                      className={`flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedChat && selectedChat.id === chat.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => selectChat(chat)}
                    >
                      <div className="relative">
                        <img 
                          src={chat.user.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                          alt={chat.user.firstName}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://geographyandyou.com/images/user-profile.png";
                          }}
                        />
                        {chat.unread > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {chat.unread}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-gray-800">{chat.user.firstName} {chat.user.lastName}</h3>
                          <span className="text-xs text-gray-500">{formatConversationDate(chat.timestamp)}</span>
                        </div>
                        <p className={`text-sm truncate ${chat.unread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Área de chat */}
            {selectedChat ? (
              <div className="w-2/3 flex flex-col">
                {/* Cabecera del chat */}
                <div className="p-4 bg-blue-600 flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={selectedChat.user.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                      alt={selectedChat.user.firstName}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://geographyandyou.com/images/user-profile.png";
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-white">{selectedChat.user.firstName} {selectedChat.user.lastName}</h3>
                      <p className="text-xs text-blue-200">
                        {selectedChat.user.age} años • {selectedChat.user.gender?.toUpperCase() || 'No especificado'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteConversation(selectedChat.id)} 
                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                {/* Mensajes */}
                <div className="flex-grow p-4 overflow-y-auto bg-gray-100">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`mb-4 max-w-[70%] ${message.senderId === currentUser._id ? 'ml-auto' : 'mr-auto'}`}
                    >
                      <div 
                        className={`p-3 rounded-lg ${
                          message.senderId === currentUser._id 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-300 rounded-bl-none'
                        }`}
                      >
                        {message.text}
                      </div>
                      <div 
                        className={`text-xs mt-1 ${
                          message.senderId === currentUser._id ? 'text-right text-gray-600' : 'text-gray-600'
                        }`}
                      >
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Formulario para enviar mensajes */}
                <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-300 flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-2/3 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Your messages</h3>
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;