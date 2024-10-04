import axios from "axios";
import { LoginRequest } from "../models/ILogin";

export const API = axios.create({
    baseURL: 'http://localhost:3000/'
});

export function useLogin() {
    async function login(data: LoginRequest) {

        // Fire the request
        const response = await API.post('api/auth/login', data);

        // Return the response
        return response;
    }

    return login;
}