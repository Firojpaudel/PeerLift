import { TestimonialCarousel } from '@/components/features/landing/TestimonialCarousel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Left side Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 bg-bg-primary relative md:w-1/2">
        <div className="w-full max-w-7xl absolute top-0 left-0 right-0 p-8 flex justify-start">
          <a
            href="/"
            className="flex items-center gap-0 text-primary-600 font-display font-extrabold text-3xl tracking-tight hover:text-primary-700 transition-colors"
          >
            <img
              src="/icon-light.png"
              alt="PeerLift Logo"
              className="w-9 h-9 rounded-lg block dark:hidden object-contain"
            />
            <img
              src="/icon-dark.png"
              alt="PeerLift Logo"
              className="w-9 h-9 rounded-lg hidden dark:block object-contain"
            />
            <span className="-ml-2">eerLift</span>
          </a>
        </div>
        <div className="w-full max-w-[400px] mt-12 mb-12">{children}</div>
      </div>

      {/* Right side Decorative (Immersive Visuals) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-gradient-to-br from-primary-400 via-primary-500 to-accent-terracotta overflow-hidden">
        {/* Background Decorative patterns */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px',
          }}
        ></div>

        {/* Large abstract blobs */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        {/* Foreground Content */}
        <div className="relative z-20 w-full max-w-xl mx-8 flex flex-col items-center">
          <TestimonialCarousel />
        </div>
      </div>
    </div>
  );
}
