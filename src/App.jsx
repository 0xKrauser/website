import { Routes, Route, Outlet } from "react-router-dom";

import "./App.scss";
import Ecdsa from "./pages/ecdsa";
import Home from "./pages/Home";

// Create a root route

function Root() {
	return (
		<div className="BorderContainer">
			<div className="Navigation"></div>
			<div className="ViewportContainer">
				<div className="Viewport">
					<div className="Content">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}

function App() {
	return (
		<div className="app">
			<Routes>
				<Route path="/" element={<Root />}>
					<Route index element={<Home />} />
					<Route path="ecdsa" element={<Ecdsa />} />
				</Route>
			</Routes>
		</div>
	);
}

export default App;
