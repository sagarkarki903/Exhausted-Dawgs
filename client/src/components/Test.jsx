import { useState, useEffect } from 'react'
import axios from "axios"


function Test() {

    const [members, setMembers] = useState([]);

    const fetchAPI = async () => {
    try {
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

export default Test;