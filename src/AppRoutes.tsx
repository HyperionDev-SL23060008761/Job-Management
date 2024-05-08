//External Imports
import { Route, Routes } from "react-router-dom";

//Internal Imports
import Home from "./pages/Home";

//Export the App Routes
export default function AppRoutes() {
	//Return the Routes
	return (
		<Routes>
			<Route path="/" element={<Home />} />
		</Routes>
	);
}
