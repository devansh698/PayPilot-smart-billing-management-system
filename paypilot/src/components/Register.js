import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap'; // Import necessary components from reactstrap
import axios from 'axios';
import Lottie from "lottie-react"; // Import Lottie for animations
import animationData from './animation/Animation - registation.json';
import animationData1 from './animation/Animation - registation sucessfull.json';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState(''); // New field
    const [companyAddress, setCompanyAddress] = useState(''); // New field
    const [phoneNumber, setPhoneNumber] = useState(''); // New field
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/auth/register', {
                username, email, phone:phoneNumber, password
            });
            setIsOtpSent(true);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/auth/verify-otp-register', {
                email,
                otp,
            });
            setIsSuccess(true);
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (err) {
            setError(err.response.data.message);
        }
    };
    const isValidEmail = (email) => {
        const validTlds = ['com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'biz', 'info', 'pro', 'name', 'museum', 'asia', 'cat', 'coop', 'jobs', 'mobi', 'tel', 'travel', 'xxx', 'aero', 'arpa', 'biz', 'com', 'coop', 'edu', 'gov', 'info', 'int', 'jobs', 'mil', 'mobi', 'museum', 'name', 'net', 'org', 'pro', 'tel', 'travel', 'xxx', 'ac', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'an', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cs', 'cu', 'cv', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'st', 'sv', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw'];
        const emailRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.(?:${validTlds.join('|')})$`);
        return emailRegex.test(email);
      };

    return (
        <div>
          {isSuccess && (
            <div style={{display: "flex",justifyContent: "center",alignItems: "center",position: "fixed",top: 0,left: 0,right: 0,bottom: 0,zIndex: 1000,backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}>
              <div style={{backgroundColor: "transparent", padding: "20px"
              }}>
                <Lottie animationData={animationData1} style={{ width: "100%", height: "100%" }} />
                <h4>Product Added to Inventory!</h4>
              </div>
            </div>
          )}
            
            {!isOtpSent ? (
                <>
            <div style={{display:"flex"}}>
                <div style={{ width:"50%",margin:"auto",marginTop:"5%",padding:"2%" }}>
                <Form onSubmit={handleRegister}>
                    <h2>Register</h2>
                    <FormGroup>
                        <Label for="username">Username</Label>
                        <Input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            invalid={!isValidEmail(email) && email.length > 0}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="companyName">Company Name</Label>
                        <Input
                            type="text"
                            id="companyName"
                            placeholder="Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="companyAddress">Company Address</Label>
                        <Input
                            type="text"
                            id="companyAddress"
                            placeholder="Company Address"
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="phoneNumber">Phone Number</Label>
                        <Input
                            type="text"
                            id="phoneNumber"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <Button type="submit">Register</Button>
                    {error && <Alert color="danger">{error}</Alert>}
                </Form>
                </div>
                <div style={{ width: 400, margin: 'auto' ,display:"flex"}}>
                <Lottie animationData={animationData} />
                </div>
            </div>

            </>
            ) : (
                <Form onSubmit={handleVerifyOtp}>
                    <h2>Verify OTP</h2>
                    <FormGroup>
                        <Label for="otp">Enter OTP</Label>
                        <Input
                            type="text"
                            id="otp"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <Button type="submit">Verify OTP</Button>
                    {error && <Alert color="danger">{error}</Alert>}
                </Form>
            )}
        </div>
    );
};

export default Register;