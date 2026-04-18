import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function SessionsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full min-h-screen">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold mb-2">My Sessions</h1>
          <p className="text-text-secondary">Keep track of your scheduled exchanges.</p>
        </div>
        <Button variant="primary">Schedule New</Button>
      </header>

      {/* Basic week view structure */}
      <div className="grid grid-cols-7 gap-4 pt-6 mt-4 border-t border-border mb-8">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="text-center font-mono text-sm border-r border-border last:border-0 pb-2">
            <div className="text-text-muted">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</div>
            <div className="font-bold text-lg mt-1 text-text-primary">{20 + i}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6 mt-10">
        <h2 className="text-xl font-display font-extrabold text-bg-muted">Upcoming</h2>
        
        <Card className="p-0 overflow-hidden flex flex-col md:flex-row items-stretch rounded-xl group hover:-translate-y-1 transition-transform cursor-pointer">
          <div className="w-4 bg-primary-500 shrink-0"></div>
          <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex flex-col">
              <span className="text-primary-700 font-bold font-mono tracking-wider mb-2 text-sm uppercase">TOMORROW, 2:00 PM</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">React Architecture</span>
                <span className="text-text-muted mx-2">with</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-border-strong font-bold flex items-center justify-center text-xs">AS</div>
                  <span className="font-medium text-text-secondary">Alex Smith</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="soft">Reschedule</Button>
              <Button variant="primary">Join Link</Button>
            </div>
            
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center text-text-muted p-12 border-2 border-dashed border-border rounded-xl">
        <span className="text-4xl mb-4 block opacity-50">🗓️</span>
        <p>Your calendar is quite empty.</p>
        <p className="mt-1"><a href="/explore" className="text-primary-500 hover:underline">Find a match</a> to start filling it up!</p>
      </div>
    </div>
  )
}
