import React from 'react'
import { useState, useEffect } from 'react'
import axios from "axios"


function Test() {

    const [testInfo, setTestInfo] = useState(null);
    const [members, setMembers] = useState([]);

    const fetchAPI = async () => {
    try {
        const response1 = await axios.get("http://localhost:8080/test");
        console.log("Test Response:", response1.data);
        setTestInfo(response1.data);

        const response2 = await axios.get("http://localhost:8080/members");
        console.log("Members Response:", response2.data);
        setMembers(response2.data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};


  useEffect(() => {
    fetchAPI();
}, []);


  return (
    <>
        <div>
                <h1>Test Route</h1>
                <p>{testInfo}</p>

                <h1>Members Route</h1>
                <ul>
                    {members.map((member) => (
                        <li key={member.member_id}>
                            <strong>{member.Full_Name}</strong> - {member.Roles}
                        </li>
                    ))}
                </ul>
            </div>
    </>
  )
}

export default Test
