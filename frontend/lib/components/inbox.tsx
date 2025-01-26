import React, { useState, useEffect } from 'react';
import { useApi, Inbox as InboxType, InboxMessage } from '../api';
import { useRouter } from "../routes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; 

dayjs.extend(relativeTime);

interface InboxProps {
  onClose: () => void;
}

const Inbox: React.FC<InboxProps> = ({ onClose }) => {
  const [inbox, setInbox] = useState<InboxType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const { getInbox } = useApi();
  const { push } = useRouter();

  useEffect(() => {
    const fetchInbox = async () => {
      setInitialLoading(true); // Start initial loading
      try {
        const inbox = await getInbox();
        console.log('Fetched inbox:', inbox);
        setInbox(inbox);
      } catch (error) {
        console.error('Error fetching inbox messages:', error);
      } 
    };

    fetchInbox();
  }, []);

  useEffect(() => {
    if (inbox != null) {
      setInitialLoading(false);
    }
  }, [inbox]);

  const handleSelectMessage = (message: InboxMessage) => {
    if (!!message.redirect) {
      push(message.redirect)
      onClose();
    }
  };

  if (initialLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col max-w-md w-full">
      <div className="flex justify-between items-center p-2 border-b border-gray-300">
        <h2 className="text-xl font-bold">Inbox</h2>
        <button onClick={onClose} className="cursor-pointer">Close</button>
      </div>
      <div className="flex">
        <div className="bg-gray-100 p-4 border-r border-gray-300 w-full overflow-auto">
          <ul>
            {inbox.messages.map(message => (
             <li
             key={message.created_at}
             onClick={() => handleSelectMessage(message)}
             className="cursor-pointer p-2 border-b border-gray-300 hover:bg-gray-200 break-words flex justify-between items-center"
           >
             <span className="font-bold">{message.content}</span>
             <span className="text-xs text-gray-500">{dayjs(message.created_at).fromNow()}</span>
           </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
