import axios from "axios";

const ecdsa_server = axios.create({
	baseURL: "https://ecdsa-server-mock.onrender.com/",
});

const over_server = axios.create({
	baseURL: "https://over-server.onrender.com/", // "http://localhost:3042/"
});

export { ecdsa_server, over_server };
