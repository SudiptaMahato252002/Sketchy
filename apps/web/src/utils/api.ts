import axios from "axios"

const BASE_URL='http://localhost:3200/api/v1'


export async function SignUp(username:string,email:string,password:string)
{
    const response=await axios.post(`${BASE_URL}/user/sign-up`,{
        username,email,password,
    },{headers:{
        'Content-Type':'application/json'
    }})
    return response.data
}

export async function SignIn(email:string,password:string)
{
    const response=await axios.post(`${BASE_URL}/user/sign-in`,
        {email,password},
        {
        headers:{
            'Content-Type':'application/json'
        }
    })
    return response.data
}

export async function Logout(refreshToken:string)
{
    const accessToken = localStorage.getItem("accessToken");
    const response=await axios.post(`${BASE_URL}/user/logout`,
        {refreshToken},
        {
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${accessToken}`
            }
        }
    )
}

export async function CreateRoom(slug:string)
{
    const accessToken=localStorage.getItem('accessToken')
    const response=await axios.post(`${BASE_URL}/user/create-room`,
        {slug},
    {
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${accessToken}`
        }
    }
    )
    return response.data
}

export async function GetRoomById(roomId:number)
{
    const accessToken=localStorage.getItem('accessToken')
    const response=await axios.get(`${BASE_URL}/user/get-room/${roomId}`,
        {
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${accessToken}`
            }
        }
    )
}

export async function GetUserRooms()
{
    const accessToken=localStorage.getItem('accessToken')
    
    const resposne=await axios.get(`${BASE_URL}/user/get-user-rooms`,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${accessToken}`
        }       
    })
}


