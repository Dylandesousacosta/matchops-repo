import { useState, useEffect, React } from 'react';
import { getUsers, addUser, authenticateUser, getProfileByUserId } from './util/api';
import DatingProfile from './components/datingProfile';
import './App.css';
import Matches from './components/matches';

function App() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [membershipType, setMembershipType] = useState("Free");
    const [successMessage, setSuccessMessage] = useState(""); 

    const [showLogin, setShowLogin] = useState(false);
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loggedInUser, setLoggedInUser] = useState(null);

    const [profile, setProfile] = useState(null);

    const [showHome, setShowHome] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [showMatches, setShowMatches] = useState(false);

    useEffect(() => {
        async function fetchData() {
            //const usersData = await getUsers();
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
            setSuccessMessage("User added successfully!"); 

            setUsername("");
            setEmail("");
            setFirstName("");
            setLastName("");
            setPassword("");
            setMembershipType("Free");
            setShowLogin(true);
            setLoginUsername(userData.username);
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
            setSuccessMessage("Login successful!");

            const users = await getUsers();
            const user = users.find(u => u.username === loginUsername);
            setLoggedInUser(user);
            setLoginUsername("");
            setLoginPassword("");
            //setShowLogin(false);
            try {
                const profile = await getProfileByUserId(user._id);
                console.log("User profile:", profile);
                setProfile(profile);
            } catch (error) {
                console.log("No profile found yet.");
                setProfile(null);
            }
        } else {
            alert("Login failed: " + (response.error || "Unknown error"));
        }
    }


    if (loggedInUser) {
        return (
            <div className="welcome-container">
                <div className="header">
                    <button
                        className="logout-button"
                        onClick={() => {
                            setLoggedInUser(null);
                            setProfile(null);
                            setLoginUsername("");
                            setLoginPassword("");
                            setShowHome(true)
                        }}
                    >
                        Logout
                    </button>
                    <h1>Welcome to the Looking For Love App!</h1>
                </div>

                <h3>You are logged in as: {loggedInUser.membershipType?.type === 'Paid' ? 'Paid User' : 'Guest User'}</h3>

                {profile && Object.keys(profile).length > 0 && !editingProfile ? (
                    <div className="profile-display">
                        <h2>Your Dating Profile</h2>
                        <p><strong>Bio:</strong> {profile.bio}</p>
                        <p><strong>Age:</strong> {profile.age}</p>
                        <p><strong>Gender:</strong> {profile.gender}</p>
                        <p><strong>Looking for:</strong> {profile.lookingFor}</p>
                        <p><strong>Interests:</strong> {profile.interests.join(', ')}</p>
                        <p><strong>Location:</strong> {profile.location}</p>
                        <p><strong>Skills:</strong> {profile.skills.join(', ')}</p>
                        {profile && (
                        <>
                            <button onClick={() => setEditingProfile(true)}>Update Profile</button>
                            <br></br>
                            <br></br>
                            <button onClick={() => setShowMatches(!showMatches)}>
                                {showMatches ? "Hide Matches" : "Find Matches"}
                            </button>
                        </>
                        )}
                        {showMatches && <Matches currentUser={loggedInUser} />}
                    </div>
                ) : (
                    <>
                        <p>{profile ? "Update your profile details below." : "You haven't created a dating profile yet."}</p>
                        <DatingProfile
                            user={loggedInUser}
                            setProfile={(updated) => {
                                setProfile(updated);
                                setEditingProfile(false);
                            }}
                            existingProfile={profile}
                        />
                    </>
                )}

            </div>
        );
    }

    return (
        <div className="app-container">
            {showHome ? (
                <>
                    <div className="home-section">
                        <h1>Welcome to the Looking For Love App!</h1>
                    </div>
                    <p><b>Find your perfect match. Create your profile and start connecting today!</b></p>
                    <p>Stop swiping, start connecting. Our app matches you with people who actually share your interests using our algorithm which finds you the best connections.</p>
                    <p>Join our community of successful daters and find your forever person.</p>
                    Already have an account?
                    <div className="button-container">
                        <button onClick={() => { setShowHome(false); setShowLogin(true); }}>Login</button>
                    </div>
                    Don't have an account?
                    <div className="button-container">
                        <button onClick={() => { setShowHome(false); setShowLogin(false); }}>Register</button>
                    </div>
                </>
            ) : showLogin ? (
                <>
                    <a href="#" className="back-link" onClick={() => setShowHome(true)}>
                        ← Go back to Home
                    </a>
                    <h2>User Login</h2>
                    <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    <div className="button-container">
                        <button onClick={handleLogin}>Login</button>
                    </div>
                    <p>
                        Don't have an account?{" "}
                        <button onClick={() => setShowLogin(false)}>Register</button>
                    </p>
                </>
            ) : (
                <>
                    <a href="#" className="back-link" onClick={() => setShowHome(true)}>
                        ← Go back to Home
                    </a>
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
                    <p>
                        Already have an account?{" "}
                        <button onClick={() => setShowLogin(true)}>Sign In</button>
                    </p>

                    {successMessage && <div className="success-message">{successMessage}</div>} {/* Here */}

                </>
            )}
        </div>
    );
}

export default App;
