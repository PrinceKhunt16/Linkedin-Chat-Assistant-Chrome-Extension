import React, { useEffect, useState } from 'react';
import '../index.css';
import { AiOutlineCopy } from 'react-icons/ai';
import { getGroqChatCompletion } from './groq';
import { RiDeleteBin6Line } from "react-icons/ri";

const Content = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('next-chat');
  const [nextMessage, setNextMessage] = useState('');
  const [context, setContext] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [grammerMistakeMessage, setGrammerMistakeMessage] = useState("");
  const [avoidedGrammerMistakeMessage, setAvoidedGrammerMistakeMessage] = useState("");
  const [messageTemplateTextarea, setMessageTemplateTextarea] = useState("");
  const [responseMessageTemplate, setResponseMessageTemplate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("Icebreaker Generator");
  const [storageKey, setStorageKey] = useState("");
  const [storageValue, setStorageValue] = useState("");
  const [savedData, setSavedData] = useState({});
  const messageTemplatesOptions = [
    "Icebreaker Generator",
    "Follow-Up Message Generator",
    "Thank-You Message Generator",
    "Job Inquiry Message Generator",
    "Networking Pitch Generator",
    "Event Invitation Message Generator",
    "Feedback Request Generator",
    "Collaboration Proposal Generator",
    "Meeting Scheduler",
    "Apology Message Generator",
    "Recommendation Request Generator",
    "Connection Request Message Generator",
    "Follow-Up Reminder",
    "Networking Follow-Up",
  ];
  const placeholderMessages = [
    `Add details to generate an icebreaker message. For example:
    - Name: [Name]
    - Job Title: [Job Title]
    - Company: [Company]
    - Specific detail about their profile (e.g., recent post, achievement): [Detail]`,

    `Add details to generate a follow-up message. For example:
    - Name: [Name]
    - Event/Meeting: [Event/Meeting Name]
    - Topic discussed: [Topic]
    - Next steps or interest: [Next Steps]`,

    `Add details to generate a thank-you message. For example:
    - Name: [Name]
    - Help provided: [Task/Advice]
    - How it helped you: [Impact]`,

    `Add details to generate a job inquiry message. For example:
    - Name: [Name]
    - Job Title: [Job Title]
    - Company: [Company]
    - Your background: [Your Skills/Experience]`,

    `Add details to generate a networking pitch. For example:
    - Name: [Name]
    - Your role: [Your Job Title]
    - Your expertise: [Your Skills]
    - Interest or goal: [Specific Interest/Goal]`,

    `Add details to generate an event invitation. For example:
    - Name: [Name]
    - Event Name: [Event Name]
    - Date and Time: [Date and Time]
    - Why it’s relevant to them: [Relevance]`,

    `Add details to generate a feedback request. For example:
    - Name: [Name]
    - What you’re seeking feedback on: [Specific Work/Profile]
    - Why their feedback is valuable: [Reason]`,

    `Add details to generate a collaboration proposal. For example:
    - Name: [Name]
    - Your project/idea: [Project/Idea]
    - How their skills align: [Alignment]
    - Potential collaboration benefits: [Benefits]`,

    `Add details to schedule a meeting. For example:
    - Name: [Name]
    - Purpose of the meeting: [Purpose]
    - Proposed date and time: [Date and Time]
    - Duration: [Duration]`,

    `Add details to generate an apology message. For example:
    - Name: [Name]
    - Reason for the apology: [Reason]
    - How you plan to resolve the issue: [Resolution]`,

    `Add details to request a recommendation. For example:
    - Name: [Name]
    - Your relationship with them: [Relationship]
    - Specific skills or projects you’d like them to highlight: [Skills/Projects]`,

    `Add details to generate a connection request message. For example:
    - Name: [Name]
    - Job Title: [Job Title]
    - Company: [Company]
    - Why you want to connect: [Reason]`,

    `Add details to generate a follow-up reminder. For example:
    - Name: [Name]
    - Task/Conversation you’re following up on: [Task/Conversation]
    - Next steps or action required: [Next Steps]`,

    `Add details to generate a networking follow-up message. For example:
    - Name: [Name]
    - Event where you met: [Event Name]
    - Topic discussed: [Topic]
    - Next steps or interest: [Next Steps]`,
  ];

  const saveToLocalStorage = () => {
    if (!storageKey || !storageValue) {
      alert("Please enter both a key and a value.");
      return;
    }

    const updatedData = { ...savedData, [storageKey]: storageValue };
    chrome.storage.local.set({ savedData: updatedData }, () => {
      setSavedData(updatedData);
      setStorageKey("");
      setStorageValue("");
      alert("Saved successfully!");
    });
  };

  const handleDelete = (key) => {
    const updatedData = { ...savedData };
    delete updatedData[key];
    chrome.storage.local.set({ savedData: updatedData }, () => {
      setSavedData(updatedData);
      alert("Deleted successfully!");
    });
  }

  const handleUseCaseChange = (value) => {
    setSelectedUseCase(value);
    setIsDropdownOpen(false);
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard!');
    });
  };

  const extractMessages = () => {
    const messageElements = document.querySelectorAll('.msg-s-message-list-content');
    const rawText = Array.from(messageElements).map(el => el.textContent.trim())[0];
    const cleanedRawText = rawText.replace(/\s+/g, ' ').trim();
    return cleanedRawText;
  };

  const generateNextMessage = async () => {
    if (!groqApiKey) {
      alert('Please save your Groq API key first. Click on Extension Popup. Follow the instructions.');
      return;
    }

    const context = extractMessages();
    const prompt = `
      You are a professional LinkedIn messaging assistant. Based on the provided conversation context, generate a concise and professional next message from the user's perspective. Ensure the message is friendly yet professional, grammatically correct, and engaging. Maintain the intended meaning while improving clarity.
      
      Follow these key principles while crafting the message:
        - Respond Directly to the Previous Message: Address the last message's content or question.
        - Be Concise & Clear: Keep the message short and to the point.
        - Professional but Friendly Tone: Balance formality with a natural, engaging tone.
        - Value-Driven Approach: Show how the conversation benefits both sides.
        - Use Greetings Smartly: Keep it only if necessary, based on the conversation flow. If the user includes a greeting, keep it. If not, avoid adding one unless it naturally fits.
      
      Return only the refined message itself.

      Context: ${context}
    `;

    const chatCompletion = await getGroqChatCompletion(groqApiKey, prompt);

    setNextMessage(chatCompletion.choices[0]?.message?.content || '');
  }

  const generateMessageFromContext = async () => {
    try {
      if (!groqApiKey) {
        alert('Please save your Groq API key first. Click on Extention Popup. Follow the instruction.');
        return;
      }

      const prompt = `
        You are a professional LinkedIn messaging assistant.  
        Based on the provided context, generate a concise, professional, and engaging message.  
        - Ensure the message is clear, grammatically correct, and meaningful.  
        - Use a natural, courteous, and professional tone.  
        - Retain the original intent and meaning while improving readability and clarity.  
        - Return only the refined message itself, without any extra text or formatting.  

        Context: ${context}

        Return only the refined message itself.
      `;

      const chatCompletion = await getGroqChatCompletion(groqApiKey, prompt);

      setGeneratedMessage(chatCompletion.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating message:', error);
      alert('Failed to generate message. Please try again.');
    }
  };

  const avoidGrammerMistakesFromMessage = async () => {
    try {
      if (!groqApiKey) {
        alert('Please save your Groq API key first. Click on Extention Popup. Follow the instruction.');
        return;
      }

      const prompt = `
        You are a professional grammar and spelling correction assistant. Your task is to review the provided message and fix any grammar or spelling mistakes without changing the meaning, tone, or style of the message. Do not add, remove, or rephrase any content unless it is necessary to correct a grammatical or spelling error.

        Follow these rules strictly:
          1. **Fix Grammar**: Correct any grammatical errors, such as subject-verb agreement, tense, punctuation, or sentence structure.
          2. **Fix Spelling**: Correct any misspelled words.
          3. **Preserve Meaning**: Do not change the intended meaning of the message.
          4. **Preserve Tone**: Maintain the original tone (e.g., formal, casual, professional).
          5. **No Additions**: Do not add any new content, suggestions, or explanations.
          6. **No Deletions**: Do not remove any content unless it is redundant or incorrect.

        Return only the corrected message.

        Message to correct: ${grammerMistakeMessage}
      `;

      const responseMessage = await getGroqChatCompletion(groqApiKey, prompt);

      setAvoidedGrammerMistakeMessage(responseMessage.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating message:', error);
      alert('Failed to generate message. Please try again.');
    }
  };

  const generateMessageFromTemplate = async () => {
    try {
      if (!groqApiKey) {
        alert("Please save your Groq API key first. Click on Extension Popup. Follow the instructions.");
        return;
      }

      let prompt = "";

      switch (selectedTemplate) {
        case "Icebreaker Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a professional and engaging icebreaker message for connecting with someone on LinkedIn. Follow these guidelines:
              - Mention something specific about their profile (e.g., recent post, achievement).
              - Keep the tone friendly and professional.
              - Be concise and clear.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Follow-Up Message Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a polite and professional follow-up message for someone you recently met or interacted with. Follow these guidelines:
              - Mention the previous interaction (e.g., event, meeting).
              - Express interest in continuing the conversation.
              - Keep the tone friendly and professional.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Thank-You Message Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a sincere thank-you message for someone who helped you. Follow these guidelines:
              - Mention the specific help or advice they provided.
              - Express appreciation and how it benefited you.
              - Keep the tone warm and professional.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Job Inquiry Message Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a professional message to inquire about job opportunities. Follow these guidelines:
              - Mention the job title and company you're interested in.
              - Briefly highlight your relevant skills and experience.
              - Keep the tone professional and respectful.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Networking Pitch Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a concise networking pitch to introduce yourself. Follow these guidelines:
              - Mention your role, expertise, and interests.
              - Explain why you're reaching out and how you can collaborate.
              - Keep the tone professional and engaging.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Event Invitation Message Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a professional message to invite someone to an event. Follow these guidelines:
              - Mention the event name, date, and time.
              - Explain why the event might be relevant to them.
              - Keep the tone professional and inviting.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Feedback Request Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a polite message to request feedback. Follow these guidelines:
              - Mention what you're seeking feedback on (e.g., profile, work).
              - Explain why their feedback is valuable.
              - Keep the tone professional and respectful.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Collaboration Proposal Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a professional message to propose a collaboration. Follow these guidelines:
              - Mention your project or idea.
              - Explain how their skills align with your project.
              - Highlight the potential benefits of collaboration.
              - Keep the tone professional and engaging.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Meeting Scheduler":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a professional message to schedule a meeting. Follow these guidelines:
              - Mention the purpose of the meeting.
              - Propose a date and time.
              - Keep the tone professional and polite.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Apology Message Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a sincere apology message. Follow these guidelines:
              - Mention the reason for the apology.
              - Express regret and how you plan to resolve the issue.
              - Keep the tone professional and empathetic.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Recommendation Request Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a polite message to request a recommendation. Follow these guidelines:
              - Mention your relationship with the person.
              - Highlight specific skills or projects you'd like them to mention.
              - Keep the tone professional and respectful.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Connection Request Message Generator":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a personalized connection request message. Follow these guidelines:
              - Mention why you want to connect.
              - Highlight common interests or goals.
              - Keep the tone professional and engaging.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Follow-Up Reminder":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a polite follow-up reminder message. Follow these guidelines:
              - Mention the task or conversation you're following up on.
              - Suggest next steps or actions.
              - Keep the tone professional and polite.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        case "Networking Follow-Up":
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a professional follow-up message after a networking event. Follow these guidelines:
              - Mention the event and what you discussed.
              - Express interest in staying connected.
              - Keep the tone professional and friendly.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
          break;

        default:
          prompt = `
            You are a professional LinkedIn messaging assistant. Generate a concise and professional LinkedIn message based on the provided context. Follow these guidelines:
              - Keep the tone professional and engaging.
              - Be concise and clear.
              - Maintain the intended meaning and tone.
              - Ensure the message is concise.
      
            Context: ${messageTemplateTextarea}
      
            Return only the refined message itself.
          `;
      }

      const responseMessage = await getGroqChatCompletion(groqApiKey, prompt);

      setResponseMessageTemplate(responseMessage.choices[0]?.message?.content || "");
    } catch (error) {
      console.error("Error generating message:", error);
      alert("Failed to generate message. Please try again.");
    }
  };

  useEffect(() => {
    chrome.storage.local.get(["groqApiKey"], (result) => {
      if (result.groqApiKey) {
        setGroqApiKey(result.groqApiKey);
      }
    });

    chrome.storage.local.get(["savedData"], (result) => {
      if (result.savedData) {
        setSavedData(result.savedData);
      }
    });
  }, []);

  return (
    <div className="chat-assistant-container" style={{ fontFamily: "Lusitana, sans-serif" }}>
      <h3 style={{ fontFamily: "Lusitana, sans-serif" }}>LinkedIn Chat Assistant <a href="https://princekhunt16.github.io/PortfolioWebsite/" target="_blank" rel="noopener noreferrer">---</a></h3>
      <div className="custom-dropdown">
        <div
          className="dropdown-header"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ fontFamily: "Lusitana, sans-serif" }}
        >
          {selectedUseCase === 'next-chat'
            && '1. Next message for your conversation'}
          {selectedUseCase === 'create-chat'
            && '2. Create context based message'}
          {selectedUseCase === 'grammer-mistakes'
            && '3. Avoid Grammer Mistakes'}
          {selectedUseCase === 'message-templates'
            && '4. Message Templates'}
          {selectedUseCase === 'storage'
            && '5. Storage'}
          <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
        </div>
        {isDropdownOpen && (
          <div className="dropdown-options">
            <div
              className="dropdown-option"
              onClick={() => handleUseCaseChange('next-chat')}
              style={{ fontFamily: "Lusitana, sans-serif" }}
            >
              1. Next message for your conversation
            </div>
            <div
              className="dropdown-option"
              onClick={() => handleUseCaseChange('create-chat')}
              style={{ fontFamily: "Lusitana, sans-serif" }}
            >
              2. Create context based message
            </div>
            <div
              className="dropdown-option"
              onClick={() => handleUseCaseChange('grammer-mistakes')}
              style={{ fontFamily: "Lusitana, sans-serif" }}
            >
              3. Avoid Grammer Mistakes
            </div>
            <div
              className="dropdown-option"
              onClick={() => handleUseCaseChange('message-templates')}
              style={{ fontFamily: "Lusitana, sans-serif" }}
            >
              4. Message Templates
            </div>
            <div
              className="dropdown-option"
              onClick={() => handleUseCaseChange('storage')}
              style={{ fontFamily: "Lusitana, sans-serif" }}
            >
              5. Storage
            </div>
          </div>
        )}
      </div>
      {selectedUseCase === 'next-chat' && (
        <div className="use-case-container">
          <button
            className="generate-button"
            onClick={generateNextMessage}
            style={{ fontFamily: "Lusitana, sans-serif" }}
          >
            Generate
          </button>
          {nextMessage && (
            <div className="message-container">
              <p style={{ fontFamily: "Lusitana, sans-serif" }}>{nextMessage || 'Next message will appear here...'}</p>
              {nextMessage && (
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(nextMessage)}
                  style={{ fontFamily: "Lusitana, sans-serif" }}
                >
                  <AiOutlineCopy />
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {selectedUseCase === 'create-chat' && (
        <div className="use-case-container">
          <textarea
            placeholder="Enter context (e.g., I want to network with a UX designer)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="context-textarea"
            style={{ fontFamily: "Lusitana, sans-serif" }}
          />
          <button
            className="generate-button"
            onClick={generateMessageFromContext}
            style={{ fontFamily: "Lusitana, sans-serif" }}
          >
            Generate
          </button>
          {generatedMessage && (
            <div className="message-container">
              <p style={{ fontFamily: "Lusitana, sans-serif" }}>{generatedMessage}</p>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(generatedMessage)}
                style={{ fontFamily: "Lusitana, sans-serif" }}
              >
                <AiOutlineCopy />
              </button>
            </div>
          )}
        </div>
      )}
      {selectedUseCase === 'grammer-mistakes' && (
        <div className="use-case-container">
          <textarea
            placeholder="Enter message to remove grammetical mistakes (e.g., Spell Errors)"
            value={grammerMistakeMessage}
            onChange={(e) => setGrammerMistakeMessage(e.target.value)}
            className="context-textarea"
            style={{ fontFamily: "Lusitana, sans-serif" }}
          />
          <button
            className="generate-button"
            onClick={avoidGrammerMistakesFromMessage}
            style={{ fontFamily: "Lusitana, sans-serif" }}
          >
            New Message
          </button>
          {avoidedGrammerMistakeMessage && (
            <div className="message-container">
              <p style={{ fontFamily: "Lusitana, sans-serif" }}>{avoidedGrammerMistakeMessage}</p>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(avoidedGrammerMistakeMessage)}
                style={{ fontFamily: "Lusitana, sans-serif" }}
              >
                <AiOutlineCopy />
              </button>
            </div>
          )}
        </div>
      )}
      {selectedUseCase === 'message-templates' && (
        <div>
          <div className="sub-menu">
            {messageTemplatesOptions.map((template, index) => (
              <div
                key={index}
                className={`sub-menu-option ${selectedTemplate === template ? "active" : ""}`}
                onClick={() => handleTemplateChange(template)}
                style={{ fontFamily: "Lusitana, sans-serif" }}
              >
                {template}
              </div>
            ))}
          </div>
          <div className="message-template-container">
            <div className="use-case-container">
              <textarea
                placeholder={
                  selectedTemplate
                    ? placeholderMessages[messageTemplatesOptions.indexOf(selectedTemplate)]
                    : "Select a template to get started"
                }
                value={messageTemplateTextarea}
                onChange={(e) => setMessageTemplateTextarea(e.target.value)}
                className="context-textarea"
                style={{ fontFamily: "Lusitana, sans-serif" }}
              />
              <button
                className="generate-button"
                onClick={() => generateMessageFromTemplate()}
                style={{ fontFamily: "Lusitana, sans-serif" }}
              >
                Generate
              </button>
              {responseMessageTemplate && (
                <div className="message-container">
                  <p style={{ fontFamily: "Lusitana, sans-serif" }}>{responseMessageTemplate}</p>
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(responseMessageTemplate)}
                    style={{ fontFamily: "Lusitana, sans-serif" }}
                  >
                    <AiOutlineCopy />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {selectedUseCase === 'storage' && (
        <div className="storage-container">
          <input
            type="text"
            placeholder="Message known as"
            value={storageKey}
            onChange={(e) => setStorageKey(e.target.value)}
            className="storage-input"
            style={{ fontFamily: "Lusitana, sans-serif" }}
          />
          <textarea
            placeholder="Message"
            value={storageValue}
            onChange={(e) => setStorageValue(e.target.value)}
            className="context-textarea"
            style={{ fontFamily: "Lusitana, sans-serif" }}
          />
          <button
            className="generate-button"
            onClick={saveToLocalStorage}
            style={{ fontFamily: "Lusitana, sans-serif" }}
          >
            Save
          </button>
          {Object.keys(savedData).length > 0 && (
            <div className="saved-data-container">
              <h4 className='saved-prompt-title' style={{ fontFamily: "Lusitana, sans-serif" }}>Saved Messages:</h4>
              {Object.entries(savedData).map(([key, value]) => (
                <div key={key} className='storage-item'>
                  <h2 className='saved-item-key' style={{ fontFamily: "Lusitana, sans-serif" }}>{key}</h2>
                  <div className='storage-buttons'>
                    <button
                      className="storage-copy-button"
                      onClick={() => copyToClipboard(value)}
                      style={{ fontFamily: "Lusitana, sans-serif"}}
                      >
                      <AiOutlineCopy />
                    </button>
                    <button
                    className="storage-delete-button"
                    onClick={() => handleDelete(key)}
                    style={{ fontFamily: "Lusitana, sans-serif"}}
                  >
                    <RiDeleteBin6Line />
                  </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Content;