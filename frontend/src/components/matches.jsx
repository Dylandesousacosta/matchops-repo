import { useEffect, useState } from "react";
import { getMatchesForUser, submitRating } from "../util/api"; // Add submitRating API call

function Matches({ currentUser }) {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    function handleOpenModal(match) {
        setSelectedMatch(match);
        setShowModal(true);
        setRating(0); // reset previous rating
        setFeedback(""); // reset previous feedback
      }

      async function handleRatingSubmit() {
        if (!selectedMatch) return;
      
        try {
          const response = await fetch("/api/rate-match", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              matchId: selectedMatch._id,
              userId: currentUser._id,
              rating,
              feedback,
            }),
          });
      
          const result = await response.json();
      
          if (result.success) {
            alert("Rating submitted successfully!");
            setShowModal(false);
          } else {
            alert("Error: " + (result.message || "Something went wrong."));
          }
        } catch (error) {
          console.error("Rating submission error:", error);
          alert("Failed to submit rating.");
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
        <div className="p-4 max-w-6xl mx-auto text-left bg-gray-100 min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
      
          {error ? (
            <p className="text-red-500 font-semibold">{error}</p>
          ) : matches.length === 0 ? (
            <p>
              No matches found yet. You might need to update your profile, upgrade
              your membership, or check back later.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="p-6 rounded-xl"
                  style={{
                    border: "2px solid #666967",
                    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
                    marginBottom: "1rem",
                  }}
                >
                  <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                    {match.username}
                  </h3>
                  <p>
                    <span className="font-medium text-gray-700">Bio:</span>{" "}
                    {match.profile.bio || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Age:</span>{" "}
                    {match.profile.age || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Interests:</span>{" "}
                    {match.profile.interests?.join(", ") || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Location:</span>{" "}
                    {match.profile.location || "N/A"}
                  </p>
      
                  <button
                    onClick={() =>
                      (window.location.href = `mailto:${match.email}?subject=Hello ${match.username}&body=I saw your profile! Let's connect!`)
                    }
                    className="block w-full mt-4 bg-indigo-600 text-white text-center py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    Email {match.username}
                  </button>
      
                  <button
                    onClick={() => handleOpenModal(match)}
                    className="block w-full mt-2 bg-yellow-500 text-white text-center py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  >
                    Rate Match
                  </button>
                </div>
              ))}
            </div>
          )}
      
      {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
      <h2 className="text-xl font-semibold mb-4">Rate {selectedMatch?.username}</h2>
      
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"} focus:outline-none`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="w-full p-2 border rounded mb-4"
        placeholder="Leave a comment..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleRatingSubmit}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      );
      
}

export default Matches;
