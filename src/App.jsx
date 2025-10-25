import React, { useState, useEffect } from "react";

const Popup = () => {
  const [groqApiKey, setGroqApiKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["groqApiKey"], (result) => {
      if (result.groqApiKey) {
        setMessage("API Key already saved successfully! 🎉");
      }
    });
  }, []);

  const handleChange = (event) => {
    setGroqApiKey(event.target.value);
  };

  const saveGroqApiKey = () => {
    if (groqApiKey.trim() === "") {
      setMessage("Please enter a valid API key.");
      return;
    }

    chrome.storage.local.set({ groqApiKey }, () => {
      setMessage("API Key saved successfully! 🎉");
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.h1tag}>LinkedIn Chat Assistant</h1>
      <p style={styles.ptag}>
        Your AI-powered messaging assistant for smarter, faster, and more
        professional LinkedIn conversations.
      </p>
      <p style={styles.ptag}>
        Visit{" "}
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noopener noreferrer"
        >
          Groq Cloud
        </a>{" "}
        to get your API key.
      </p>
      <p style={styles.ptag}>
        <strong>Important:</strong> This tool was crafted with care by&nbsp;
        <a
          href="https://www.linkedin.com/in/prince-khunt-linked-in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Prince Khunt
        </a>. A <strong>huge thanks to{" "}
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noopener noreferrer"
        >
          Groq Cloud
        </a></strong>{" "}
        for providing the API key. To get started, ensure you have your API key ready. Once obtained, navigate to the
        LinkedIn messaging page (
        <a
          href="https://www.linkedin.com/messaging/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn Messaging
        </a>
        ) and <strong>reload the page</strong> to activate the extension in the right sidebar.
      </p>
      <input
        type="text"
        placeholder="Enter API Key"
        value={groqApiKey}
        onChange={handleChange}
        style={styles.input}
      />
      <button onClick={saveGroqApiKey} style={styles.button}>
        Save API Key
      </button>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Lusitana, sans-serif",
    width: "320px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
  },
  h1tag: {
    fontFamily: "Lusitana, sans-serif",
    fontSize: "28px",
    fontWeight: "300",
    boxSizing: "borderBox",
    textAlign: "center",
  },
  ptag: {
    fontFamily: "Lusitana, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    boxSizing: "borderBox",
    textAlign: "left",
  },
  input: {
    fontFamily: "Lusitana, sans-serif",
    width: "300px",
    padding: "8px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "borderBox",
  },
  button: {
    fontFamily: "Lusitana, sans-serif",
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "320px",
    boxSizing: "borderBox",
    fontSize: "16px",
  },
  message: {
    fontFamily: "Lusitana, sans-serif",
    marginTop: "10px",
    fontSize: "14px",
    color: "green",
  },
};

export default Popup;