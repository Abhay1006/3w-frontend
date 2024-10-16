import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css'; // Import the CSS file for styling

const socket = io('http://localhost:5000');

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [pointsAwarded, setPointsAwarded] = useState(null);
  const [newUserName, setNewUserName] = useState('');

  // Fetch initial users
  useEffect(() => {
    axios.get('http://localhost:5000/users').then(res => {
      setUsers(res.data);
    });

    // Listen for leaderboard updates
    socket.on('leaderboard-update', (updatedUsers) => {
      setLeaderboard(updatedUsers);
    });

    // Fetch initial leaderboard
    axios.get('http://localhost:5000/leaderboard').then(res => {
      setLeaderboard(res.data);
    });
  }, []);

  const claimPoints = () => {
    axios.post(`http://localhost:5000/claim-points/${selectedUser}`)
      .then(res => {
        setPointsAwarded(res.data.message);
      })
      .catch(err => console.error(err));
  };

  const addUser = (e) => {
    e.preventDefault();
    if (newUserName) {
      axios.post('http://localhost:5000/users', { name: newUserName })
        .then(res => {
          setUsers([...users, res.data]); // Add the new user to the list
          setNewUserName(''); // Clear input field
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="App">
      <h1 className="title">Leaderboard</h1>

      {/* User Selection */}
      <div className="user-selection">
        <select className="user-dropdown" onChange={e => setSelectedUser(e.target.value)} value={selectedUser}>
          <option value="">Select a User</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
        <button className="claim-btn" onClick={claimPoints} disabled={!selectedUser}>Claim Points</button>
      </div>

      {/* Display Awarded Points */}
      {pointsAwarded && <p className="points-awarded">{pointsAwarded}</p>}

      {/* Add New User */}
      <h2 className="subtitle">Add New User</h2>
      <form className="add-user-form" onSubmit={addUser}>
        <input
          className="input-field"
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Enter user name"
          required
        />
        <button className="add-btn" type="submit">Add User</button>
      </form>

      {/* Leaderboard */}
      <h2 className="subtitle">Current Leaderboard</h2>
      <ul className="leaderboard">
        {leaderboard.map((user, index) => (
          <li key={user._id} className="leaderboard-item">
            {index + 1}. {user.name} - {user.totalPoints} points
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
