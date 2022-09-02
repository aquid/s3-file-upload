import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);

  const submitFile = async () => {
    try {
      if (!file) {
        throw new Error('Select a file first!');
      }
      console.log(file);
      const formData = new FormData();
      formData.append('file', file[0]);
      await axios.post(`/file-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('file upload success');
    } catch (error) {
      alert('file upload error');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div  className="FileForm">
          <label>Upload file</label>
          <input type="file" onChange={event => setFile(event.target.files)} />
          <button type="submit" onClick={submitFile}>Send</button>
        </div>
      </header>
    </div>
  );
}

export default App;
