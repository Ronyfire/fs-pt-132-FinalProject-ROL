// const backendUrl = import.meta.env.VITE_BACKEND_URL

// export const apiFetch = async (endpoint, options = {}) => {

//     const token = localStorage.getItem("token")

//     const response = await fetch(`${backendUrl}${endpoint}`, {
//         ...options,
//         headers: {
//             "Content-Type": "application/json",
//             ...(token && {
//                 Authorization: `Bearer ${token}`
//             }),
//             ...options.headers
//         }
//     })

//     const data = await response.json()

//     if (!response.ok) {
//         throw new Error(data.msg || "Error")
//     }

//     return data
// }