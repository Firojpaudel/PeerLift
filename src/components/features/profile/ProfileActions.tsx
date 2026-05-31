"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Dialog } from "@/components/ui/Dialog/Dialog"
import Link from "next/link"
import { toast } from "sonner"

// Simplified types for the props
type SkillLine = { id: string, skill: { id: string, name: string } }
type UserProfile = { id: string, name: string, username: string, skillsOffered: SkillLine[], skillsWanted: SkillLine[] }

export function ProfileActions({ 
  user, 
  currentUser 
}: { 
  user: UserProfile, 
  currentUser: UserProfile | null 
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<"SELECT_TYPE" | "LEARN_FROM_THEM" | "TEACH_THEM">("SELECT_TYPE")
  
  // Selections
  const [selectedTargetSkill, setSelectedTargetSkill] = useState("")
  const [exchangeType, setExchangeType] = useState<"SKILL" | "CREDITS">("SKILL")
  const [selectedMySkill, setSelectedMySkill] = useState("")
  const [creditAmount, setCreditAmount] = useState(30)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // I teach, they want
  const skillsICanTeach = currentUser?.skillsOffered.filter(myOffer =>
    user.skillsWanted.some(theyWant => theyWant.skill.id === myOffer.skill.id)
  ) || []

  // If I want to learn a skill they DON'T explicitly know I want (I can still just ask to learn it)
  const allSkillsTheyTeach = user.skillsOffered
  const allSkillsITeach = currentUser?.skillsOffered || []

  const resetForm = () => {
    setMode("SELECT_TYPE")
    setSelectedTargetSkill("")
    setExchangeType("SKILL")
    setSelectedMySkill("")
    setCreditAmount(30)
    setMessage("")
    setIsSubmitting(false)
  }

  const handleOpen = () => {
    resetForm()
    setModalOpen(true)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    
    const payload: any = {
      receiverId: user.id,
      message,
    }

    if (mode === "LEARN_FROM_THEM") {
      // I am learner, requesting their skill
      payload.requestedSkillId = selectedTargetSkill
      if (exchangeType === "SKILL") {
        payload.offeredSkillId = selectedMySkill
      } else {
        payload.offeredCredits = creditAmount
      }
    } else {
      // I am mentor, offering my skill
      payload.offeredSkillId = selectedMySkill
      if (exchangeType === "SKILL") {
        payload.requestedSkillId = selectedTargetSkill
      } else {
        payload.requestedCredits = creditAmount
      }
    }

    fetch("/api/requests", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(payload) 
    }).then(res => res.json()).then(() => {
      setIsSubmitting(false)
      setModalOpen(false)
      toast.success("Request sent successfully!")
    }).catch(err => {
      console.error(err)
      setIsSubmitting(false)
      toast.error("Failed to send request")
    })
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-end gap-3 shrink-0 pt-4 md:pt-0">
        <Link href={`/login?callbackUrl=/u/${user.username}`}>
          <Button variant="primary" className="bg-amber-500 hover:bg-amber-600 rounded-xl px-5 text-[15px] shadow-sm font-bold text-white transition-all h-[42px]">
            Login to Request
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3 shrink-0 pt-4 md:pt-0">
        <Button onClick={handleOpen} variant="primary" className="bg-amber-500 hover:bg-amber-600 rounded-xl px-5 text-[15px] shadow-[var(--shadow-sm)] font-bold text-white transition-all h-[42px]">
          Send Request
        </Button>
        <Link href={`/sessions/chat?peerId=${user.id}&peerName=${encodeURIComponent(user.name || "User")}`} className="inline-flex items-center justify-center font-semibold text-text-primary hover:bg-bg-secondary rounded-xl text-[15px] px-5 h-[42px] transition-colors">
            Message
          
        </Link>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        {mode === "SELECT_TYPE" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-display font-bold text-text-primary">What&apos;s your goal?</h2>
            <p className="text-text-secondary text-sm">Do you want to learn from {user.name}, or offer to teach them something?</p>
            
            <div className="grid grid-cols-1 gap-4 mt-2">
              <button 
                onClick={() => setMode("LEARN_FROM_THEM")}
                className="flex flex-col items-start p-5 rounded-2xl border-2 border-border hover:border-primary-500 hover:bg-bg-secondary text-left transition-all"
              >
                <div className="flex items-center gap-3 w-full mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">🎓</div>
                  <span className="font-bold text-lg text-text-primary">Learn from {user.name}</span>
                </div>
                <p className="text-sm text-text-secondary pl-11">Request a session where {user.name} teaches you one of their skills.</p>
              </button>

              <button 
                onClick={() => setMode("TEACH_THEM")}
                className="flex flex-col items-start p-5 rounded-2xl border-2 border-border hover:border-secondary-500 hover:bg-bg-secondary text-left transition-all"
              >
                <div className="flex items-center gap-3 w-full mb-1">
                  <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold">💡</div>
                  <span className="font-bold text-lg text-text-primary">Teach {user.name}</span>
                </div>
                <p className="text-sm text-text-secondary pl-11">Offer to teach {user.name} a skill they are looking to learn.</p>
              </button>
            </div>
          </div>
        )}

        {mode === "LEARN_FROM_THEM" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setMode("SELECT_TYPE")} className="w-8 h-8 rounded-full hover:bg-bg-secondary flex items-center justify-center -ml-2 text-text-muted hover:text-text-primary">←</button>
              <h2 className="text-xl font-display font-bold text-text-primary">Learn from {user.name}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">What do you want to learn?</label>
                <select 
                  className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px]"
                  value={selectedTargetSkill}
                  onChange={(e) => setSelectedTargetSkill(e.target.value)}
                >
                  <option value="" disabled>Select a skill...</option>
                  {allSkillsTheyTeach.map(s => (
                    <option key={s.id} value={s.id}>{s.skill.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">What will you offer in return?</label>
                <div className="flex bg-bg-secondary p-1 rounded-xl mb-3 border border-border">
                  <button 
                    className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-lg transition-colors ${exchangeType === "SKILL" ? "bg-bg-elevated shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary"}`}
                    onClick={() => setExchangeType("SKILL")}
                  >Trade Skill</button>
                  <button 
                    className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-lg transition-colors ${exchangeType === "CREDITS" ? "bg-bg-elevated shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary"}`}
                    onClick={() => setExchangeType("CREDITS")}
                  >Offer Credits</button>
                </div>

                {exchangeType === "SKILL" && (
                  <select 
                    className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px]"
                    value={selectedMySkill}
                    onChange={(e) => setSelectedMySkill(e.target.value)}
                  >
                    <option value="" disabled>Select one of your skills to teach...</option>
                    {skillsICanTeach.length > 0 ? (
                      <optgroup label="Skills they want to learn">
                        {skillsICanTeach.map(s => <option key={s.id} value={s.id}>{s.skill.name}</option>)}
                      </optgroup>
                    ) : null}
                    <optgroup label="Other skills you teach">
                      {allSkillsITeach.filter(s => !skillsICanTeach.find(x => x.id === s.id)).map(s => (
                        <option key={s.id} value={s.id}>{s.skill.name}</option>
                      ))}
                    </optgroup>
                  </select>
                )}

                {exchangeType === "CREDITS" && (
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" min="10" max="500" step="10" 
                      value={creditAmount} 
                      onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                      className="w-24 text-center bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px] font-bold"
                    />
                    <span className="font-bold text-text-secondary">Credits per session</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Message</label>
                <textarea 
                  rows={3} 
                  placeholder={`Hi ${user.name}! I'd love to...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px] resize-none"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !selectedTargetSkill || (exchangeType === "SKILL" && !selectedMySkill)} 
                variant="primary" className="w-full mt-2 h-12"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        )}

        {mode === "TEACH_THEM" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setMode("SELECT_TYPE")} className="w-8 h-8 rounded-full hover:bg-bg-secondary flex items-center justify-center -ml-2 text-text-muted hover:text-text-primary">←</button>
              <h2 className="text-xl font-display font-bold text-text-primary">Teach {user.name}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">What will you teach them?</label>
                <select 
                  className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px]"
                  value={selectedMySkill}
                  onChange={(e) => setSelectedMySkill(e.target.value)}
                >
                  <option value="" disabled>Select one of your skills...</option>
                  {allSkillsITeach.map(s => (
                    <option key={s.id} value={s.id}>{s.skill.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">What do you want in return?</label>
                <div className="flex bg-bg-secondary p-1 rounded-xl mb-3 border border-border">
                  <button 
                    className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-lg transition-colors ${exchangeType === "SKILL" ? "bg-bg-elevated shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary"}`}
                    onClick={() => setExchangeType("SKILL")}
                  >Learn a Skill</button>
                  <button 
                    className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-lg transition-colors ${exchangeType === "CREDITS" ? "bg-bg-elevated shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary"}`}
                    onClick={() => setExchangeType("CREDITS")}
                  >Ask for Credits</button>
                </div>

                {exchangeType === "SKILL" && (
                  <select 
                    className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px]"
                    value={selectedTargetSkill}
                    onChange={(e) => setSelectedTargetSkill(e.target.value)}
                  >
                    <option value="" disabled>Select a skill they teach...</option>
                    {allSkillsTheyTeach.map(s => (
                      <option key={s.id} value={s.id}>{s.skill.name}</option>
                    ))}
                  </select>
                )}

                {exchangeType === "CREDITS" && (
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" min="10" max="500" step="10" 
                      value={creditAmount} 
                      onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                      className="w-24 text-center bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px] font-bold"
                    />
                    <span className="font-bold text-text-secondary">Credits per session</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Message</label>
                <textarea 
                  rows={3} 
                  placeholder={`Hi ${user.name}! I noticed you want to learn...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-text-primary text-[15px] resize-none"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !selectedMySkill || (exchangeType === "SKILL" && !selectedTargetSkill)} 
                variant="primary" className="w-full mt-2 h-12"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}
