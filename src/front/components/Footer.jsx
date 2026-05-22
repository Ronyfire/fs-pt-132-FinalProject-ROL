import { Link } from "react-router-dom";

export const Footer = () => {
  return (
	<footer className="bg-dark text-light mt-auto py-4 border-top">
	  <div className="container">
		<div className="row gy-4">

		  <div className="col-md-4">
			<h3 className="h5">Game-Side</h3>
			<p className="mb-0">
			  Discover, organize, and share your favorite video games in a modern,
			  personalized experience.
			</p>
		  </div>

		  <div className="col-md-4">
			<h4 className="h6">Navigation</h4>

			<ul className="list-unstyled mb-0">
			  <li>
				<Link to="/" className="text-light text-decoration-none">
				  Home
				</Link>
			  </li>

			  <li>
				<Link to="/games" className="text-light text-decoration-none">
				  Games
				</Link>
			  </li>

			  <li>
				<Link to="/survey" className="text-light text-decoration-none">
				  Survey
				</Link>
			  </li>

			  <li>
				<Link to="/profile" className="text-light text-decoration-none">
				  Profile
				</Link>
			  </li>
			</ul>
		  </div>

		  <div className="col-md-4">
			<h4 className="h6">Contact</h4>

			<p className="mb-1">
			  contact@game-side.org
			</p>

			<p className="mb-1">
			  GitHub
			</p>

			<p className="mb-0">
			  Twitter
			</p>
		  </div>

		</div>

		<hr className="border-secondary my-4" />

		<div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
		  <small>
			© {new Date().getFullYear()} Game-Side. All rights reserved.
		  </small>

		  <small>
			Game data powered by IGDB API.
		  </small>
		</div>
	  </div>
	</footer>
  );
};