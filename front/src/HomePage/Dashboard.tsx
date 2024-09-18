import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash, FiEye, FiSearch } from "react-icons/fi";
import "./Home.css";

export default function Home() {
  const post = "http://localhost:3002"; // Adjust the URL to point to your server
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Assume you have the user's unit stored in localStorage/sessionStorage after login
  const userUnit = localStorage.getItem("unit");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${post}/all_complaints?unit=${userUnit}`
        );
        const data = response.data;
        setData(data);
        setFilteredData(data); // By default, show all complaints for the user's unit
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [post, userUnit]);

  useEffect(() => {
    filterData();
  }, [searchQuery, data]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase().trim());
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${post}/delete_complaint/${id}`);
      setData(data.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleRowClick = (id) => {
    console.log("2");
    navigate(`/detail/${id}`);
  };

  const filterData = () => {
    let filtered = data;

    if (searchQuery) {
      filtered = filtered.filter((item) => {
        const nameMatch =
          item.name && item.name.toLowerCase().includes(searchQuery);
        const defectMatch =
          item.defect && item.defect.toLowerCase().includes(searchQuery);
        const itemMatch =
          item.item && item.item.toLowerCase().includes(searchQuery);
        return nameMatch || defectMatch || itemMatch;
      });
    }

    setFilteredData(filtered);
  };

  return (
    <div className="p-0 home_cont min-h-screen text-[#1A2130] mt-[0px]">
      <div className="banner flex justify-center">
        <h1 className="text-5xl text-blue-950 font-bold flex items-center">
          <span className="text-red-500">C</span>omplaint
          <span className="text-red-500 pl-4">R</span>egister
          <img src="../../public/complaint.svg" className="w-12 ml-5" alt="" />
        </h1>
      </div>

      <div className="table-cont bg-white rounded-lg mb-[50px]">
        <div className="relative mb-4 flex justify-between">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search..."
            className="p-2 pl-10 mr-8 border border-gray-300 rounded-lg ml-8"
          />
        </div>

        <table className="w-full bg-white rounded-lg text-black">
          <thead>
            <tr className="bg-[#3FA2F6] text-[17px] h-14 text-black border-b-2 border-gray-400">
              <th className="p-4">S.No</th>
              <th className="p-4">Name</th>
              <th>Item</th>
              <th className="p-4">Working Status</th>
              <th className="p-4">Delivery Status</th>
              <th className="p-4">Defect</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={item._id}
                className="border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors duration-200 ease-in-out"
                onDoubleClick={() => handleRowClick(item._id)}
              >
                <td className="p-4 pl-12">{index + 1}</td>
                <td className="p-4 font-bold">{item.name}</td>
                <td className="p-4">{item.item}</td>
                <td className="p-4">{item.status}</td>
                <td className="p-4">
                  <span
                    className={`p-2 rounded ${
                      item.delivery_status === "with_us"
                        ? "bg-red-400"
                        : "bg-green-400"
                    } text-white`}
                  >
                    {item.delivery_status}
                  </span>
                </td>
                <td className="p-4">{item.defect}</td>
                <td className="p-4">
                  <button
                    className="text-gray-500 hover:text-blue-500 mx-2"
                    onClick={() => handleEdit(item._id)}
                  >
                    <span className="bg-green-700 inline-block p-2 rounded transform hover:scale-105 transition-transform duration-200 hover:bg-green-600 ">
                      <FiEdit className="text-white" />
                    </span>
                  </button>
                  <button
                    className="text-gray-500 hover:text-red-500 mx-2"
                    onClick={() => handleDelete(item._id)}
                  >
                    <span className="bg-red-600 inline-block p-2 rounded transform hover:scale-105 transition-transform duration-200 hover:bg-red-400 ">
                      <FiTrash className="text-white" />
                    </span>
                  </button>
                  <button
                    className="text-gray-500 hover:text-blue-500 mx-2"
                    onClick={() => handleRowClick(item._id)}
                  >
                    <span className="bg-blue-700 inline-block p-2 rounded transform hover:bg-blue-500 hover:scale-105 transition-transform duration-200">
                      <FiEye className="text-white" />
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
