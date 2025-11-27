
export default function Register() {
  return (
    <div>
      <div className="register-card">
        <h3 className="text-center mb-4">Create Account</h3>

        <form>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Phone Number"
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Create Password"
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
            />
          </div>

          <button className="btn btn-custom w-100 mt-2">Register</button>

          <p className="text-center mt-3 text-small">
            Already have an account? <a href="#">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

