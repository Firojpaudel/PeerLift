import { Button } from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-center px-4">
      <div className="text-[120px] font-display font-extrabold text-primary-200 mb-4 leading-none">404</div>
      <h1 className="text-3xl font-display font-bold text-text-primary mb-4">We couldn&apos;t find that page</h1>
      <p className="text-text-secondary max-w-md mx-auto mb-8">
        It looks like you&apos;ve wandered into an uncharted area. Let&apos;s get you back on track to trading skills!
      </p>
      <a href="/">
         <Button variant="primary" className="px-8 py-6 text-lg">Return to Home</Button>
      </a>
    </div>
  )
}
