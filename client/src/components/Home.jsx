import React from 'react'
import { useState, useEffect } from 'react'
import axios from "axios"

export const Home = () => {

    const fetchAPI = async ()=> {
        const response = await axios.get("http://localhost:8080/");
        console.log(response.data);
      }
    

      useEffect(() => {
        fetchAPI();
    }, [])
    


  return (
    <>
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold">Hello, Dawgs!</h1>
            </div>
        </div>

    </>
    
  )
}
