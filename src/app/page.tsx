import { Button } from '@/components/ui/Button';
import { HeroIllustration } from '@/components/ui/HeroIllustration';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden flex flex-col items-center">
      {/* Navbar for Landing Page */}
      <nav className="w-full h-20 flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto z-50 relative">
        <div className="font-display font-extrabold text-2xl tracking-tight text-primary-600">
          PeerLift
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a href="/login">
            <Button variant="ghost" className="font-medium text-text-primary">
              Log in
            </Button>
          </a>
          <a href="/register">
            <Button className="bg-bg-elevated border border-border shadow-sm text-text-primary hover:bg-bg-secondary transition-colors">
              Sign up
            </Button>
          </a>
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 flex-1 flex flex-col pt-12 md:pt-24 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-6xl md:text-[80px] font-display font-extrabold leading-[1] text-text-primary tracking-tighter">
              Trade Skills.
              <br />
              Grow <span className="text-primary-600">Together.</span>
            </h1>

            <p className="text-xl text-text-secondary max-w-[500px] leading-relaxed">
              Eliminate financial barriers to learning through peer
              collaboration. Exchange what you know for what you want to learn.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center lg:justify-start w-full pt-4">
              <a href="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  className="text-lg px-8 h-14 w-full sm:w-auto font-medium rounded-lg"
                >
                  Get Started — It&apos;s Free
                </Button>
              </a>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="text-lg h-14 px-8 w-full sm:w-auto font-medium text-text-secondary hover:text-text-primary rounded-lg"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            <div className="hidden md:flex pt-12 mt-4 w-full text-xs font-mono uppercase text-primary-700/80 tracking-[0.15em] items-center flex-wrap gap-4">
              <span>2,400+ SKILLS LISTED</span>
              <span className="text-primary-400 text-lg leading-none">•</span>
              <span>1,800+ SESSIONS</span>
              <span className="text-primary-400 text-lg leading-none">•</span>
              <span>500+ GENZ ACTIVE</span>
            </div>
          </div>

          <div className="flex-1 w-full relative hidden lg:block h-[600px] select-none">
            <HeroIllustration />
          </div>
        </div>
      </main>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="w-full bg-bg-elevated py-24 border-t border-border mt-20 relative z-20"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-extrabold text-text-primary mb-4">
              How it works
            </h2>
            <p className="text-text-secondary text-lg">
              Join a community of lifelong learners and trade what you know for
              what you want to learn, at zero cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-primary-100 via-primary-300 to-primary-100 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-display font-bold shadow-[var(--shadow-glow-primary)] mb-6">
                1
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">
                List your skills
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Create a profile highlighting the skills you can teach and the
                ones you&apos;re looking to learn.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-display font-bold shadow-[var(--shadow-glow-primary)] mb-6">
                2
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">
                Get matched
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Our algorithm pairs you with community members who want what you
                offer and offer what you want.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-display font-bold shadow-[var(--shadow-glow-primary)] mb-6">
                3
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">
                Exchange & grow
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Schedule a video session, trade knowledge, and help each other
                reach your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
