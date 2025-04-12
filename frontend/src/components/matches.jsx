import { useEffect, useState } from "react";
import { getMatchesForUser, submitRating } from "../util/api"; // Add submitRating API call
import { updateUserInfo } from "../util/api";

function Matches({ currentUser, setLoggedInUser }) {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [editingAccount, setEditingAccount] = useState(false);

    function handleOpenModal(match) {
        setSelectedMatch(match);
        setShowModal(true);
        setRating(0); // reset previous rating
        setFeedback(""); // reset previous feedback
    }

    async function handleRatingSubmit() {
        if (!selectedMatch) return;

        const ratingData = {
            fromUserId: currentUser._id,
            toUserId: selectedMatch._id,
            stars: rating,
            comment: feedback,
        };

        const result = await submitRating(ratingData);

        if (result.success) {
            alert("Rating submitted successfully!");
            setShowModal(false);
            fetchMatches();
        } else {
            alert("Error: " + result.error);
        }
    }


    async function fetchMatches() {
        try {
            const data = await getMatchesForUser(currentUser._id);

            if (data.error) {
                setError(data.error);
                setMatches([]);
            } else {
                setMatches(data);
                setError("");
            }
        } catch (err) {
            console.error("Failed to fetch matches:", err);
            setError("An unexpected error occurred while fetching matches.");
            setMatches([]);
        }
    }

    useEffect(() => {
        console.log("Updated matches:", matches);
    }, [matches]);

    useEffect(() => {
        if (currentUser?._id) {
            fetchMatches();
        }
    }, [currentUser]);

    return (
        <div className="match-results-container">
            <h2>Your Matches</h2>
            {error ? (
                error === "Upgrade your membership to view matches" ? (
                    <div className="upgrade-notice">
                        <p className="error-message">{error}</p>
                        {editingAccount ? (
                            <div className="edit-account-container">
                                <h3>Edit Account Info</h3>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={currentUser.firstName}
                                    onChange={(e) =>
                                        setLoggedInUser({ ...currentUser, firstName: e.target.value })
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={currentUser.lastName}
                                    onChange={(e) =>
                                        setLoggedInUser({ ...currentUser, lastName: e.target.value })
                                    }
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={currentUser.email}
                                    onChange={(e) =>
                                        setLoggedInUser({ ...currentUser, email: e.target.value })
                                    }
                                />
                                <select
                                    value={currentUser.membershipType?.type}
                                    onChange={(e) =>
                                        setLoggedInUser({
                                            ...currentUser,
                                            membershipType: {
                                                ...currentUser.membershipType,
                                                type: e.target.value,
                                            },
                                        })
                                    }
                                >
                                    <option value="Free">Free</option>
                                    <option value="Paid">Paid</option>
                                </select>

                                <div className="modal-buttons">
                                    <button
                                        className="cancel"
                                        onClick={() => setEditingAccount(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="submit"
                                        onClick={async () => {
                                            const updated = await updateUserInfo(currentUser._id, {
                                                firstName: currentUser.firstName,
                                                lastName: currentUser.lastName,
                                                email: currentUser.email,
                                                membershipType: { type: currentUser.membershipType.type },
                                            });
                                            if (updated) {
                                                alert("Account updated!");
                                                setEditingAccount(false);
                                            } else {
                                                alert("Failed to update.");
                                            }
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className="upgrade-button" onClick={() => setEditingAccount(true)}>
                                Upgrade Membership
                            </button>
                        )}
                    </div>

                ) : (
                    <p className="error-message">{error}</p>
                )
            ) : matches.length === 0 ? (
                <p>
                    No matches found yet. You might need to update your profile, upgrade
                    your membership, or check back later.
                </p>
            ) : (
                matches.map((match) => (
                    <div key={match._id} className="match-card">
                        <h3 className="match-header">{match.username}</h3>
                        <p><span className="font-medium text-gray-700">Bio:</span> {match.profile.bio || "N/A"}</p>
                        <p><span className="font-medium text-gray-700">Age:</span> {match.profile.age || "N/A"}</p>
                        <p><span className="font-medium text-gray-700">Interests:</span> {match.profile.interests?.join(", ") || "N/A"}</p>
                        <p><span className="font-medium text-gray-700">Location:</span> {match.profile.location || "N/A"}</p>

                        <button
                            className="match-button email"
                            onClick={() =>
                                (window.location.href = `mailto:${match.email}?subject=Hello ${match.username}&body=I saw your profile on Looking for Love!`)
                            }
                        >
                            Email {match.username}
                        </button>

                        {match.hasRated ? (
                            <button className="match-button rated" disabled>
                                Already Rated
                            </button>
                        ) : (
                            <button
                                className="match-button rate"
                                onClick={() => handleOpenModal(match)}
                            >
                                Rate Match
                            </button>
                        )}
                    </div>
                ))
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Rate {selectedMatch?.username}</h2>

                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={star <= rating ? "filled" : "empty"}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="rating-comment"
                            placeholder="Leave a comment..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />

                        <div className="modal-buttons">
                            <button onClick={() => setShowModal(false)} className="cancel">
                                Cancel
                            </button>
                            <button onClick={handleRatingSubmit} className="submit">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

export default Matches;
