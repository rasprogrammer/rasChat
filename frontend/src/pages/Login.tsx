export default function Login () {
  return (
    <>
      <div className="login-wrapper">
        <div className="login-card">
          <h3 className="text-center mb-4">Welcome Back Login</h3>

          <form>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email Address"
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
              />
            </div>

            {/* Remember + Forgot */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" />
                <label className="form-check-label remember-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>

              <a href="#" className="text-link">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="btn btn-login w-100 mt-2">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
