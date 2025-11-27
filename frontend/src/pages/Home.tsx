import { Link } from "react-router-dom";
export default function Home() {
  return (
    <>
      <h2 style={{ textAlign: "center" }}>Welcome to rasChat Application New!</h2>
       <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/login" className="btn btn-primary px-4 py-2">
          Login Here
        </Link>
      </div>
    </>
  );
}
