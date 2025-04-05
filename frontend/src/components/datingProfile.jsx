import { useState, useContext } from "react";
import { saveProfile } from "../util/api";

function DatingProfile({ user, setProfile, existingProfile }) {
    const [bio, setBio] = useState(existingProfile?.bio || "");
    const [age, setAge] = useState(existingProfile?.age || "");
    const [gender, setGender] = useState(existingProfile?.gender || "Male");
    const [lookingFor, setLookingFor] = useState(existingProfile?.lookingFor || "Any");
    const [interests, setInterests] = useState((existingProfile?.interests || []).join(","));
    const [location, setLocation] = useState(existingProfile?.location || "");
    const [skills, setSkills] = useState((existingProfile?.skills || []).join(","));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bio || !age || !gender || !lookingFor || !interests || !location || !skills) {
            alert("Please fill in all profile fields before submitting.");
            return;
        }
        const profileData = {
            userId: user._id,
            bio,
            age,
            gender,
            lookingFor,
            interests: interests.split(',').map(item => item.trim()),
            location,
            skills: skills.split(',').map(item => item.trim()),
        };
        console.log("Submitting profile:", profileData);
        // Send to backend API
        const success = await saveProfile(profileData, user._id);
        if (success) {
            alert("Profile saved successfully!");
            setProfile({ ...profileData, userId: user._id });
        } else {
            alert("Failed to save profile.");
        }

    };

    return (
        <div className="dating-profile-container">
            <h2>Dating Profile</h2>
            <form onSubmit={handleSubmit}>
                <label>Bio</label>
                <textarea
                    placeholder="Bio / About Me"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                <label>Age</label>
                <select value={age} onChange={(e) => setAge(e.target.value)}>
                    <option value="">Select your age</option>
                    {Array.from({ length: 83 }, (_, i) => i + 18).map((ageOption) => (
                        <option key={ageOption} value={ageOption}>{ageOption}</option>
                    ))}
                </select>

                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                </select>

                <label>Select who you are looking for</label>
                <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Any</option>
                </select>

                <label>Your Interests</label>
                <select
                    multiple
                    value={interests.split(',')}
                    onChange={(e) =>
                        setInterests([...e.target.selectedOptions].map(o => o.value).join(','))
                    }
                >
                    <option>Coding</option>
                    <option>Movies</option>
                    <option>Music</option>
                    <option>Travel</option>
                    <option>Sports</option>
                    <option>Gaming</option>
                    <option>Reading</option>
                    <option>Cooking</option>
                </select>

                <label>Your Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="">Select your location</option>
                    <option>Ontario</option>
                    <option>Alberta</option>
                    <option>British Columbia</option>
                    <option>Saskatchewan</option>
                    <option>Manitoba</option>
                    <option>Quebec</option>
                    <option>Nova Scotia</option>
                    <option>New Brunswick</option>
                    <option>Newfoundland</option>
                    <option>Prince Edward Island</option>
                    <option>Other</option>
                </select>

                <label>Your Skills</label>
                <select
                    multiple
                    value={skills.split(',')}
                    onChange={(e) =>
                        setSkills([...e.target.selectedOptions].map(o => o.value).join(','))
                    }
                >
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>C#</option>
                    <option>React</option>
                    <option>SQL</option>
                    <option>Cooking</option>
                    <option>Drawing</option>
                    <option>Public Speaking</option>
                    <option>Photography</option>
                    <option>Fitness</option>
                </select>

                <button type="submit">Save Profile</button>
            </form>

        </div>
    );
}

export default DatingProfile;
