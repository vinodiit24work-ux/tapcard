import { Input, Switch, Textarea } from '@/components/ui/Form'
import type { ReviewCopy } from '@/types/review'

export interface ReviewSettings extends ReviewCopy {
  askForName: boolean
  showBusinessInfo: boolean
}

const Group = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-[13px] font-semibold text-ink-700">{label}</h4>
    {hint && <p className="mb-2.5 mt-0.5 text-[12px] text-ink-500">{hint}</p>}
    <div className={hint ? '' : 'mt-2.5'}>{children}</div>
  </div>
)

/** Everything the customer reads on the review page, in the order they read it. */
export function ReviewCopyEditor({ value, onChange }: { value: ReviewSettings; onChange: (p: Partial<ReviewSettings>) => void }) {
  return (
    <div className="space-y-6">
      <Group label="The question" hint="The first thing a customer reads after scanning.">
        <div className="space-y-3">
          <Input label="Headline" value={value.headline} maxLength={90} onChange={(e) => onChange({ headline: e.target.value })} placeholder="How was your experience?" />
          <Textarea label="Supporting line" value={value.description} maxLength={200} className="[&_textarea]:min-h-16" onChange={(e) => onChange({ description: e.target.value })} placeholder="Your feedback helps us serve you better." />
        </div>
      </Group>

      <Group label="Section titles">
        <div className="space-y-3">
          <Input label="Above the suggestions" value={value.suggestionsTitle} maxLength={60} onChange={(e) => onChange({ suggestionsTitle: e.target.value })} placeholder="Share your experience" />
          <Input label="Above the text box" value={value.ownReviewTitle} maxLength={60} onChange={(e) => onChange({ ownReviewTitle: e.target.value })} placeholder="Write your own review" />
          <Input label="Submit button" value={value.submitLabel} maxLength={40} onChange={(e) => onChange({ submitLabel: e.target.value })} placeholder="Submit Review" />
        </div>
      </Group>

      <Group label="After they submit">
        <div className="space-y-3">
          <Input label="Thank-you heading" value={value.thankYouTitle} maxLength={60} onChange={(e) => onChange({ thankYouTitle: e.target.value })} placeholder="Thank you!" />
          <Textarea label="Thank-you message" value={value.thankYouMessage} maxLength={240} className="[&_textarea]:min-h-16" onChange={(e) => onChange({ thankYouMessage: e.target.value })} placeholder="Thank you for sharing your experience with us." />
          <Input label="Google button" value={value.googleCtaLabel} maxLength={40} onChange={(e) => onChange({ googleCtaLabel: e.target.value })} placeholder="Review on Google" hint="Shown to every customer once they have submitted." />
        </div>
      </Group>

      <Group label="Options">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3">
            <div className="min-w-0 pr-3">
              <p className="text-[13px] font-semibold text-ink-900">Ask for a name</p>
              <p className="text-[11px] text-ink-500">Optional for the customer either way</p>
            </div>
            <Switch checked={value.askForName} onChange={(askForName) => onChange({ askForName })} label="Ask for a name" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3">
            <div className="min-w-0 pr-3">
              <p className="text-[13px] font-semibold text-ink-900">Show contact links</p>
              <p className="text-[11px] text-ink-500">WhatsApp, call, website and directions, below the review</p>
            </div>
            <Switch checked={value.showBusinessInfo} onChange={(showBusinessInfo) => onChange({ showBusinessInfo })} label="Show contact links" />
          </div>
        </div>
      </Group>
    </div>
  )
}
