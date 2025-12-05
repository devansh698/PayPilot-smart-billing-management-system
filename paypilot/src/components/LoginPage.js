import React, { useState } from "react";
import axios from "axios";
import {Container,Row,Col,Form,FormGroup,Label,Input,Button,Alert} from "reactstrap";
import Lottie from "lottie-react";
import animationData from "./animation/Animation - 1733831017954.json";
import animationData1 from "./animation/Animation - registation sucessfull.json";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });
      setIsOtpSent(true);
      setError("");
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/verify-otp-login",
        {
          email,
          otp,
        }
      );

      //console.log(response.data.token);
      localStorage.setItem("token", response.data.token);
      //console.log(localStorage.getItem("token"));
      //console.log("Login successful!");
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const validTlds = ['com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'biz', 'info', 'pro', 'name', 'museum', 'asia', 'cat', 'coop', 'jobs', 'mobi', 'tel', 'travel', 'xxx', 'aero', 'arpa', 'biz', 'com', 'coop', 'edu', 'gov', 'info', 'int', 'jobs', 'mil', 'mobi', 'museum', 'name', 'net', 'org', 'pro', 'tel', 'travel', 'xxx', 'ac', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'an', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cs', 'cu', 'cv', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'st', 'sv', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw'];
    const emailRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.(?:${validTlds.join('|')})$`);
    return emailRegex.test(email);
  };
  return (
      <div className="login-container" style={{marginTop:"10%"}}>
        {isSuccess && (
        <div style={{display: "flex",justifyContent: "center",alignItems: "center",position: "fixed",top: 0,left: 0,right: 0,bottom: 0,zIndex: 1000,backgroundColor: "rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{backgroundColor: "transparent", padding: "20px"
          }}>
            <Lottie animationData={animationData1} style={{ width: "50%", height: "50%" }} />
            <h4>Product Added to Inventory!</h4>
          </div>
        </div>
      )}
      <Container>
        <Row>
          <Col md={6}>
            <div className="login-card">
              {!isOtpSent ? (
                <Form onSubmit={handleLogin}>
                  <h2 className="login-title">Login</h2>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      invalid={!isValidEmail(email) && email.length > 0}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <Button type="submit" color="primary" disabled={loading}>
                    {loading ? "Loading..." : "Login"}
                  </Button>
                  {error && <Alert color="danger">{error}</Alert>}
                </Form>
              ) : (
                <Form onSubmit={handleVerifyOtp}>
                  <h2 className="login-title">Verify OTP</h2>
                  <FormGroup>
                    <Label>Enter OTP</Label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <Button type="submit" color="primary" disabled={loading}>
                    {loading ? "Loading..." : "Verify OTP"}
                  </Button>
                  {error && <Alert color="danger">{error}</Alert>}
                </Form>
              )}
              <div style={{ marginTop: "30px" }}>
                <p>
                  Don't have an account? <a href="/register">Register here</a>
                </p>
              </div>
            </div>
          </Col>
          <div style={{ display: "contents" }}>
            <Lottie
              animationData={animationData}
              style={{
                width: "35%",
                height: "35%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
