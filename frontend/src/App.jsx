import { useState, useEffect, React } from 'react';
import { getUsers, addUser, authenticateUser } from './util/api';
import './App.css';

function App() {
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [membershipType, setMembershipType] = useState("Free");

 
    const [showLogin, setShowLogin] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(null);

   
    useEffect(() => {
        async function fetchData() {
            const usersData = await getUsers();
     
        }
        fetchData();
    }, []);

   
    async function handleAddUser() {
        if (!username || !email || !firstName || !lastName || !password) {
            alert("Please fill in all fields!");
            return;
        }

        const userData = { username, email, firstName, lastName, password, type: membershipType };
        const newUser = await addUser(userData);

        if (newUser && newUser.user && newUser.user._id) {
            alert("User added successfully!");
           
            setUsername("");
            setEmail("");
            setFirstName("");
            setLastName("");
            setPassword("");
            setMembershipType("Free");
        } else {
            alert("Error adding user.");
        }
    }

    
    async function handleLogin() {
        if (!loginUsername || !loginPassword) {
            alert("Please enter username and password.");
            return;
        }

        const response = await authenticateUser({ username: loginUsername, password: loginPassword });

        if (response.message === "User authenticated successfully") {
            alert("Login successful!");

           
            const users = await getUsers();
            const user = users.find(u => u.username === loginUsername);
            setLoggedInUser(user); 
        } else {
            alert("Login failed: " + (response.error || "Unknown error"));
        }
    }

    
    if (loggedInUser) {
        return (
            <div className="welcome-container">
                <h1>Welcome to the LoveFinder App!</h1>
                <h3>You are logged in as: {loggedInUser.membershipType?.type === 'Paid' ? 'Paid User' : 'Guest User'}</h3>
            </div>
        );
    }

    return (
        <div className="app-container">
            <h2>New User Registration</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="form-group">
                <label>Membership Type: </label>
                <select value={membershipType} onChange={(e) => setMembershipType(e.target.value)}>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                </select>
            </div>
            <div className="button-container">
                <button onClick={handleAddUser}>Add User</button>
            </div>

            <hr />

            <button onClick={() => setShowLogin(!showLogin)}>
                {showLogin ? 'Hide Sign In' : 'Sign In'}
            </button>

            {showLogin && (
                <div className="login-form">
                    <h2>User Login</h2>
                    <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    <div className="button-container">
                        <button onClick={handleLogin}>Login</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
