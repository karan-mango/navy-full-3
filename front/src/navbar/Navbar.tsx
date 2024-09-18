import { useAuth } from '@/contextapi/ContextApi';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
  // Assuming you have your context in this path

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAuth, setIsAuth } = useAuth();
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    setIsAuth(false);  // Update the context to log out the user
    localStorage.removeItem('token'); // Remove token from local storage (or any other place where it is stored)
    navigate('/login');  // Redirect to login page
  };

  return (
    <div className='bg-[#1A2130] z-10 text-white fixed w-full h-[60px] pl-5 pr-5 navbar flex justify-between items-center flex-row relative top-0'>
      <div className="logo flex items-center">SO(IT) 
        <img src="../../public/Indian Navy Logo Vector.svg" className="w-22" alt="Indian Navy Logo" />
      </div>
      
      <div className="right">
        <ul className='flex capitalize'>
          <li
            className={`p-2 rounded m-2 cursor-pointer ${currentPath === '/' ? 'bg-blue-600 text-white' : ' text-gray-200'} hover:bg-blue-500`}
          >
            <Link to='/'>Dashboard</Link>
          </li>
          <li
            className={`p-2 rounded m-2 cursor-pointer ${currentPath === '/form' ? 'bg-blue-600 text-white' : ' text-gray-200'} hover:bg-blue-500`}
          >
            <Link to='/form'>Complaint</Link>
          </li>
          
          <li
            className={`p-2 rounded m-2 cursor-pointer ${currentPath === '/pending' ? 'bg-blue-600 text-white' : ' text-gray-200'} hover:bg-blue-500`}
          >
            <Link to='/pending'>Pending</Link>
          </li>

          <li
            className={`p-2 rounded m-2 cursor-pointer ${currentPath === '/bin' ? 'bg-blue-600 text-white' : ' text-gray-200'} hover:bg-blue-500`}
          >
            <Link to='/bin'>Bin</Link>
          </li>

          {/* Conditionally render Login or Logout */}
          {isAuth ? (
            <li
              className="p-2 rounded m-2 cursor-pointer text-gray-200 hover:bg-blue-500"
              onClick={handleLogout}
            >
              Logout
            </li>
          ) : (
            <li
              className={`p-2 rounded m-2 cursor-pointer ${currentPath === '/login' ? 'bg-blue-600 text-white' : ' text-gray-200'} hover:bg-blue-500`}
            >
              <Link to='/login'>Login</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
