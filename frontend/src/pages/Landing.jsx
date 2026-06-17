import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const STEPS = [
  {
    title: 'Log a few minutes a day',
    body: 'A commute, a meal, your electricity bill — small entries across transport, energy, food, waste, and shopping.',
  },
  {
    title: 'See where it actually comes from',
    body: 'A category breakdown and a daily budget gauge make the invisible visible, instead of one vague total.',
  },
  {
    title: 'Get specific, ranked next steps',
    body: 'A rule-based engine spots your biggest lever, and an AI coach turns it into a short, encouraging nudge — no guilt, no lectures.',
  },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-4xl px-4">
      <section className="grid items-center gap-8 py-16 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Personal carbon tracking</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
            Know your footprint.
            <br />
            Change one thing at a time.
          </h1>
          <p className="mt-4 text-ink/70">
            Carbon Budget turns scattered daily habits into a clear picture — and tells you, specifically, what to
            change first.
          </p>
          <div className="mt-6 flex gap-3">
            <Button as={Link} to="/signup">
              Get started free
            </Button>
            <Button as={Link} to="/login" variant="secondary">
              I already have an account
            </Button>
          </div>
        </div>

        <Card className="bg-primary-dark text-canvas" aria-hidden="true">
          <p className="font-mono text-xs uppercase tracking-widest text-amber">Today's budget</p>
          <p className="mt-2 font-display text-4xl font-bold">4.2 / 5.5 kg</p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-amber" style={{ width: '76%' }} />
          </div>
          <p className="mt-3 text-sm text-canvas/80">Transport is your biggest contributor today.</p>
        </Card>
      </section>

      <section className="py-10">
        <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
