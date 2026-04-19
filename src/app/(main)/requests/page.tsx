"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from 'next/link';
import { toast } from 'sonner';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch('/api/requests/me');
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    try {
      const res = await fetch(`/api/requests/${id}/accept`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success("Request accepted! Meeting created.");
        fetchRequests();
      } else {
        toast.error(data.error || "Failed to accept request");
      }
    } catch (err) {
      toast.error("Network error");
    }
  }

  async function handleReject(id: string) {
    try {
      const res = await fetch(`/api/requests/${id}/accept`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      if (res.ok) {
        toast.success("Request rejected.");
        fetchRequests();
      }
    } catch (err) {
      toast.error("Network error");
    }
  }

  // Filter requests by direction (sent by API)
  const filteredRequests = requests.filter(req => req.direction === filter);

  // Helper to get the display name for a skill
  const getSkillName = (skillRelation: any, credits: number | null) => {
    if (skillRelation?.skill?.name) return skillRelation.skill.name;
    if (credits) return `${credits} Credits`;
    return 'Not specified';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-extrabold mb-2">Exchange Requests</h1>
        <p className="text-text-secondary">Manage your incoming and outgoing skill trade offers.</p>
      </header>

      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8 text-sm font-medium">
           <button 
             onClick={() => setFilter('received')}
             className={`py-3 transition-colors ${filter === 'received' ? 'border-b-2 border-primary-500 text-primary-700' : 'text-text-muted hover:text-text-primary border-b-2 border-transparent'}`}
            >
              Received ({requests.filter(r => r.direction === 'received').length})
            </button>
           <button 
             onClick={() => setFilter('sent')}
             className={`py-3 transition-colors ${filter === 'sent' ? 'border-b-2 border-primary-500 text-primary-700' : 'text-text-muted hover:text-text-primary border-b-2 border-transparent'}`}
            >
              Sent ({requests.filter(r => r.direction === 'sent').length})
            </button>
        </nav>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-text-muted">Loading your requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-bg-elevated rounded-2xl border border-dashed border-border-strong">
            <p className="text-text-muted">No {filter} requests found.</p>
            <Link href="/explore" className="text-primary-500 hover:underline mt-2 inline-block">Explore skills to trade</Link>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const otherPerson = filter === 'received' ? req.sender : req.receiver;
            return (
              <Card key={req.id} className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <Link href={`/u/${otherPerson?.username || ''}`}>
                        {otherPerson?.avatarUrl ? (
                          <img 
                            src={otherPerson.avatarUrl} 
                            alt={otherPerson.name} 
                            className="w-12 h-12 rounded-full shrink-0 border-2 border-white shadow-sm object-cover hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0 border-2 border-white shadow-sm hover:scale-105 transition-transform dark:bg-primary-900/30 dark:text-primary-400">
                            {otherPerson?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </Link>
                      {req.status === 'PENDING' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 border border-white rounded-full flex items-center justify-center text-[10px] text-white">!</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/u/${otherPerson?.username || ''}`} className="hover:text-primary-600 transition-colors">
                          <h3 className="font-bold text-lg">{otherPerson?.name || 'Unknown User'}</h3>
                        </Link>
                        <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                          req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                          req.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center bg-bg-secondary px-4 py-2 rounded-lg text-sm font-medium gap-3 flex-1 md:flex-none">
                    <div className="text-center">
                      <span className="block text-xs text-text-muted uppercase tracking-wide">Wants</span>
                      <span className="font-bold">{getSkillName(req.requestedSkill, req.requestedCredits)}</span>
                    </div>
                    <span className="text-text-muted">🤝</span>
                    <div className="text-center">
                      <span className="block text-xs text-text-muted uppercase tracking-wide">Offers</span>
                      <span className="font-bold text-primary-600">{getSkillName(req.offeredSkill, req.offeredCredits)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {req.status === 'PENDING' && filter === 'received' && (
                      <>
                        <Button variant="danger" className="flex-1 md:flex-none" onClick={() => handleReject(req.id)}>Reject</Button>
                        <Button 
                          variant="primary" 
                          className="flex-1 md:flex-none bg-primary-500 hover:bg-primary-600 text-white"
                          onClick={() => handleAccept(req.id)}
                        >
                          Accept
                        </Button>
                      </>
                    )}
                    {req.status === 'PENDING' && filter === 'sent' && (
                      <span className="text-sm text-text-muted italic py-2">Awaiting response...</span>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <Link href={`/sessions/chat?peerId=${filter === 'received' ? req.senderId : req.receiverId}`} className="w-full md:w-auto">
                        <Button variant="soft" className="w-full">Open Chat</Button>
                      </Link>
                    )}
                  </div>
                </div>
                
                {req.message && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm italic text-text-secondary">&quot;{req.message}&quot;</p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
