import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from 'next/link'

export default function RequestsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-extrabold mb-2">Exchange Requests</h1>
        <p className="text-text-secondary">Manage your incoming and outgoing skill trade offers.</p>
      </header>

      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8 text-sm font-medium">
           <button className="border-b-2 border-primary-500 text-primary-700 py-3">Received</button>
           <button className="border-transparent text-text-muted hover:text-text-primary py-3">Sent</button>
           <button className="border-transparent text-text-muted hover:text-text-primary py-3">Archived</button>
        </nav>
      </div>

      <div className="space-y-4">
        {/* Existing Request */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Added actual avatar instead of generic initial block */}
              <div className="relative group">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Jane Doe" className="w-12 h-12 rounded-full shrink-0 border-2 border-white shadow-sm object-cover" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 border border-white rounded-full flex items-center justify-center text-[10px] text-white">1</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">Jane Doe</h3>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-mono">Pending</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">Requested 2 days ago</p>
              </div>
            </div>

            <div className="flex items-center justify-center bg-bg-secondary px-4 py-2 rounded-lg text-sm font-medium gap-3 flex-1 md:flex-none">
              <div className="text-center">
                <span className="block text-xs text-text-muted uppercase tracking-wide">She wants</span>
                <span>React.js</span>
              </div>
              <span className="text-text-muted">🤝</span>
              <div className="text-center">
                <span className="block text-xs text-text-muted uppercase tracking-wide">She offers</span>
                <span>Python</span>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="danger" className="flex-1 md:flex-none">Reject</Button>
              <Button variant="primary" className="flex-1 md:flex-none">Accept</Button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm italic text-text-secondary">&quot;Hi! I&apos;d love to trade some Python mentoring for help with my Next.js project. Are you free this weekend?&quot;</p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" className="text-xs py-1 px-3 h-auto">Reply Message</Button>
            </div>
          </div>
        </Card>

        {/* New Request 1 - Credits Offer */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img src="https://i.pravatar.cc/150?u=1231" alt="Sam Smith" className="w-12 h-12 rounded-full shrink-0 border-2 border-white shadow-sm object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">Sam Smith</h3>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-mono">Pending</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">Requested 5 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-center bg-bg-secondary px-4 py-2 rounded-lg text-sm font-medium gap-3 flex-1 md:flex-none">
              <div className="text-center">
                <span className="block text-xs text-text-muted uppercase tracking-wide">He wants</span>
                <span>Figma</span>
              </div>
              <span className="text-text-muted">🤝</span>
              <div className="text-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-md">
                <span className="block text-[10px] text-green-700 uppercase tracking-wide opacity-80">He offers</span>
                <span>30 Credits</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button variant="danger" className="flex-1 md:flex-none">Reject</Button>
              <Button variant="primary" className="flex-1 md:flex-none">Accept Offer</Button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm italic text-text-secondary">&quot;I don&apos;t have the skills you&apos;re looking for, but I can offer 30 credits for a 1-hour session on Figma. Let me know!&quot;</p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" className="text-xs py-1 px-3 h-auto">Reply Message</Button>
            </div>
          </div>
        </Card>

        {/* New Message Only Item */}
        <Card className="p-6 border-primary-200 bg-primary-50/30">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img src="https://i.pravatar.cc/150?u=4920" alt="Alexis" className="w-12 h-12 rounded-full shrink-0 border-2 border-white shadow-sm object-cover" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border border-white rounded-full"></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-primary-900">New Message from Alexis</h3>
                </div>
                <p className="text-sm text-text-secondary mt-1">Just now</p>
              </div>
            </div>
            
            <Link href="/sessions/chat" className="w-full md:w-auto">
              <Button variant="soft" className="w-full">Open Chat</Button>
            </Link>
          </div>
          <div className="mt-4">
            <p className="text-sm text-text-primary bg-bg-elevated dark:bg-bg-secondary p-3 border border-border rounded-lg rounded-tl-none shadow-sm">&quot;Hey! I saw your profile and was wondering if you&apos;re open to a different trade? I can offer some help with Marketing if you can teach me React.&quot;</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
