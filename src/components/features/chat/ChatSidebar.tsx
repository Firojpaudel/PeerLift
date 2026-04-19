"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bot, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Contact {
  id: string;
  name: string;
  username: string;
  lastActivity: string;
  lastSeen: string | null;
}

interface ChatSidebarProps {
  currentPeerId: string;
  onlineUsers: Set<string>;
  userId: string;
}

export function ChatSidebar({ currentPeerId, onlineUsers, userId }: ChatSidebarProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/chat/contacts");
        const data = await res.json();
        if (!data.error) setContacts(data);
      } catch (error) {
        console.error("Failed to load contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
    
    // Refresh interval every 30s as fallback if pusher isn't enough
    const interval = setInterval(fetchContacts, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const friends = filteredContacts.filter(c => c.status === 'ACCEPTED');
  const requests = filteredContacts.filter(c => c.status === 'PENDING' || c.status === 'MESSAGE_ONLY');

  return (
    <div className="w-[320px] border-r border-border h-full flex-col bg-bg-elevated hidden md:flex">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
            Messages
          </h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 ring-primary-500/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-4 space-y-6">
        {/* AI Assistant Special Entry */}
        <div className="px-3">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-3 mb-2 block">Learning Assistants</span>
          <Link 
            href="/sessions/chat?ai=true" 
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${currentPeerId === 'test-peer-id' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'hover:bg-bg-secondary text-text-primary'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm relative ${currentPeerId === 'test-peer-id' ? 'bg-white/20' : 'bg-gradient-to-br from-primary-400 to-amber-600'}`}>
              <Bot size={20} className={currentPeerId === 'test-peer-id' ? 'text-white' : 'text-white'} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[14px] truncate">Lumina AI</h3>
              <p className={`text-[11px] truncate ${currentPeerId === 'test-peer-id' ? 'text-white/80' : 'text-text-muted font-medium'}`}>Web-search & FastRTC enabled...</p>
            </div>
          </Link>
        </div>

        {/* Real Friends */}
        <div className="px-3">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-3 mb-2 block">Direct Messages</span>
          {friends.length === 0 && !isLoading && (
            <p className="text-[11px] text-text-muted italic pl-3 mt-2">No friends yet. Start trading skills!</p>
          )}
          <div className="space-y-1">
            {friends.map(contact => (
              <ContactItem 
                key={contact.id} 
                contact={contact} 
                isActive={currentPeerId === contact.id} 
                isOnline={onlineUsers.has(contact.id)}
              />
            ))}
          </div>
        </div>

        {/* Message Requests */}
        {requests.length > 0 && (
          <div className="px-3 pb-6">
             <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-3 mb-2 block">Message Requests</span>
             <div className="space-y-1">
               {requests.map(contact => (
                 <ContactItem 
                    key={contact.id} 
                    contact={contact} 
                    isActive={currentPeerId === contact.id} 
                    isOnline={onlineUsers.has(contact.id)}
                    isRequest
                 />
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactItem({ contact, isActive, isOnline, isRequest }: { contact: Contact, isActive: boolean, isOnline: boolean, isRequest?: boolean }) {
  return (
    <Link 
      href={`/sessions/chat?peerId=${contact.id}`} 
      className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'hover:bg-bg-secondary text-text-primary'}`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
          {contact.avatarUrl ? (
            <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'}`}>
              {contact.name.charAt(0)}
            </div>
          )}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-bold text-[14px] truncate leading-tight">{contact.name}</h3>
          {isRequest && !isActive && (
            <span className="bg-primary-100 text-primary-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase dark:bg-primary-900/40 dark:text-primary-300">New</span>
          )}
        </div>
        <p className={`text-[11px] truncate mt-0.5 font-medium ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
          {isOnline ? (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </span>
          ) : (
            `Last seen ${contact.lastSeen ? formatDistanceToNow(new Date(contact.lastSeen), { addSuffix: true }) : 'a long time ago'}`
          )}
        </p>
      </div>
    </Link>
  );
}
