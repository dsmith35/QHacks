import React, { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, user: 'You' }]);
      setInput('');
    }
  };

  return (
    <div className="w-80 h-96 p-4 bg-white rounded-lg shadow-md flex flex-col dark:bg-gray-800 border">
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {message.user}:
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-grow p-2 mr-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="p-2 bg-blue-600 text-white rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
