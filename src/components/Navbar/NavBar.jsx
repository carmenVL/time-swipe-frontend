import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../../utils/constants";
import { removeUser } from "../../utils/userSlice";
import axios from "axios";

const NavBar = () => {
  const user = useSelector((store) => store?.user);

  console.log(user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/api/v1/user/logout", {}, { withCredentials: true });

      dispatch(removeUser());
      return navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };



  return (
    <div className="navbar bg-base-300 px-8 fixed z-10  ">
      <div className="flex-1">
        <Link to="/" className="text-xl">
        <img src="/logo_time-swipe.png" alt="" width="200"/>
        </Link>
      </div>

      <div className="navbar-end">
        {!user && (
          <Link to="/login">
            <button className="btn hover:text-blue-500">Login</button>
          </Link>
        )}

        {user && (
          <div className="form-control">
            Welcome , {user.firstName ||  user.data.firstName} 
          </div>
        )}
      </div>
      <div className="flex-none gap-2 px-2">
        {user && (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img alt="Tailwind CSS Navbar component" src={user.photoUrl || user.data.photoUrl} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to='/dashboard'>Dashboard</Link>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
              
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;