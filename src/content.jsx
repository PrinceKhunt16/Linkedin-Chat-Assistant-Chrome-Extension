import { createRoot } from 'react-dom/client';
import React from 'react';
import { StrictMode } from 'react';
import Content from './content/Content.jsx';

const injectFont = () => {
  const styleNode = document.createElement("style");
  styleNode.textContent = `
    @font-face {
      font-family: 'Lusitana';
      src: url(${chrome.runtime.getURL("fonts/Lusitana-Regular.ttf")}) format('truetype');
      font-weight: 400;
      font-style: normal;
    }

    @font-face {
      font-family: 'Lusitana';
      src: url(${chrome.runtime.getURL("fonts/Lusitana-Bold.ttf")}) format('truetype');
      font-weight: 700;
      font-style: normal;
    }
  `;
  document.head.appendChild(styleNode);
};

let isInjected = false;

const injectChatAssistant = () => {
  if (isInjected) return;

  const adbanner = document.querySelector('.ad-banner-container');
  
  if (adbanner) {
    adbanner.style.display = 'none';
  }

  const aside = document.querySelector('.scaffold-layout__aside');
 
  if (aside) {
    if (document.getElementById('__linkedin_chat_assistant__')) {
      console.log('Chat assistant already injected.');
      return;
    }

    const root = document.createElement('div');
    root.id = '__linkedin_chat_assistant__';

    if (aside.firstChild) {
      aside.insertBefore(root, aside.firstChild);
    } else {
      aside.appendChild(root);
    }

    injectFont();

    createRoot(root).render(
      <StrictMode>
        <Content />
      </StrictMode>
    );

    console.log('React rendering complete');
  } else {
    console.error('LinkedIn <aside> tag not found!');
  }
};

const observer = new MutationObserver((mutations, observerInstance) => {
  if (!isInjected) {
    const aside = document.querySelector('.scaffold-layout__aside');
    if (aside) {
      injectChatAssistant();
      observerInstance.disconnect();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

window.addEventListener('popstate', injectChatAssistant);
window.addEventListener('pushstate', injectChatAssistant);