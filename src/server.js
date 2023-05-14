import axios from "axios";

const server = axios.create({
	baseURL: "https://ecdsa-server-mock.onrender.com/",
});

export default server;
