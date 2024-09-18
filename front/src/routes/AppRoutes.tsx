import React, { useContext } from "react";
import { Form, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import { MyContext } from "@/contextapi/ContextApi";
import Dashboard from "@/HomePage/Dashboard";
import Login from "@/login/Login";
import Navbar from "@/navbar/Navbar";
import Footer from "@/navbar/Footer";
import Form1 from "@/HomePage/Form";
import DetailPage from "@/HomePage/DetailPage";
import EditForm from "@/HomePage/EditForm";


export default function AppRoutes() {
  const { isAuth } = useContext(MyContext);

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes isAuthenticated={isAuth}>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route path="/login" element={<Login/>}  />

        <Route path="/form" element={<Form1/>} />

        

        <Route path='/detail/:id' element={<DetailPage />} />

        <Route path='/edit/:id' element={<EditForm/>} />

        
      </Routes>
      <Footer/>
      
    </div>
  );
}
