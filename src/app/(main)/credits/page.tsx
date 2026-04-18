import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { CreditCard, Zap, Plus, ArrowRight } from "lucide-react"

export default function CreditsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-extrabold mb-2 flex items-center gap-3">
          <Zap className="text-amber-500" size={32} />
          Credits & Payments
        </h1>
        <p className="text-text-secondary">Manage your balance or buy more credits to use for sessions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-8 bg-gradient-to-br from-primary-500 to-amber-600 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8" />
            
            <div className="relative z-10">
              <p className="text-white/80 font-bold uppercase tracking-wider text-sm mb-2">Current Balance</p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-6xl font-display font-extrabold leading-none">100</span>
                <span className="text-xl font-medium pb-1">Credits</span>
              </div>
              <p className="text-sm text-white/90">≈ $10.00 USD <span className="text-white/60 text-xs ml-2">(1 USD = 10 Credits)</span></p>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h3 className="font-bold text-lg mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-bg-secondary rounded flex items-center justify-center border border-border">
                    <CreditCard size={14} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Visa ending in 4242</p>
                    <p className="text-xs text-text-muted">Expires 12/28</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-primary-50 text-primary-700 px-2 py-1 rounded-md">Default</span>
              </div>
              
              <Button variant="ghost" className="w-full text-sm border border-dashed border-border-strong py-6 text-text-secondary hover:text-text-primary hover:border-primary-300">
                <Plus size={16} className="mr-2" />
                Add Payment Method
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-2 border-primary-200 bg-primary-50/10">
            <h3 className="font-bold text-lg mb-4">Buy Credits</h3>
            <div className="space-y-4">
              {[
                { amount: 50, price: "$5.00" },
                { amount: 100, price: "$10.00", popular: true },
                { amount: 200, price: "$20.00" },
                { amount: 500, price: "$50.00" }
              ].map((pack, idx) => (
                <label key={idx} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-primary-400 transition-colors ${pack.popular ? 'border-primary-400 bg-primary-50' : 'border-border bg-bg-elevated'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="credit_pack" defaultChecked={pack.popular} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                    <div>
                      <p className="font-bold text-text-primary">{pack.amount} Credits</p>
                      {pack.popular && <span className="text-[10px] font-bold uppercase bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full block mt-1 w-fit">Most Popular</span>}
                    </div>
                  </div>
                  <span className="font-bold text-lg text-text-primary">{pack.price}</span>
                </label>
              ))}
              
              <Button variant="primary" className="w-full py-6 mt-4 font-bold text-lg flex items-center justify-center gap-2 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]">
                Checkout <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
             <h3 className="font-bold text-lg mb-2">Withdraw to Bank</h3>
             <p className="text-sm text-text-secondary mb-4">You can convert your earned credits back to real money. Minimum withdrawal amount is $20.00 (200 Credits).</p>
             <Button variant="secondary" className="w-full py-5 font-bold">
                Withdraw Funds
             </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}