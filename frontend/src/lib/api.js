import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
    timeout: 15000
});

export const apiHealth = () => client.get("/health").then((r) => r.data);

export const listProducts = (params = {}) =>
    client.get("/products", { params }).then((r) => r.data);

export const listTestimonials = (params = {}) =>
    client.get("/testimonials", { params }).then((r) => r.data);

export const submitLead = (payload) =>
    client.post("/leads", payload).then((r) => r.data);

export default client;
