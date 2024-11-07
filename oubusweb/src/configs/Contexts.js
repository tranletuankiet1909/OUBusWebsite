import { createContext } from "react";

const initialState = {
    user: null, 
};
const Contexts = createContext(initialState);

export default Contexts;
