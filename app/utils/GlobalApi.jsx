const { default: axios } = require("axios");
// import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:1337/api",
})

const SignIn = (email, password) => axiosClient.post('/auth/local', {
    identifier: email,
    password: password
})

const AllStudents = () => axiosClient.get('/students').then((resp) => {
    return resp.data.data;
})



const AllTeachers = () => axiosClient.get('/teachers').then((resp) => {
    return resp.data.data;
})



const Classes = () => axiosClient.get('/classes').then((resp) => {
    return resp.data.data;
})

const Attendence = () => axiosClient.get('/attendences').then((resp) => {
    return resp.data.data;
})

export default {
    SignIn,
    AllStudents,
    AllTeachers,
    Classes,
    Attendence,
    
}