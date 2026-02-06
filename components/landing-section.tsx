'use client';

import { Shield, Zap, Lock, Brain, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LandingSectionProps {
  onGetStarted?: () => void;
}

export function LandingSection({ onGetStarted }: LandingSectionProps) {
  return (
    <section className="w-full relative overflow-hidden">
      
      {/* ════════════════════════════════════════════
          BACKGROUND EFFECTS
          ════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated blobs */}
        <div className="blob absolute top-20 left-10 w-72 h-72 bg-primary/20 blur-3xl animate-blob" />
        <div className="blob absolute top-40 right-10 w-96 h-96 bg-secondary/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="blob absolute bottom-20 left-1/3 w-80 h-80 bg-accent/20 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* ════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════ */}
      <div className="relative text-center pt-12 sm:pt-20 pb-16 sm:pb-28 px-4">
        
        {/* Animated badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8 animate-fade-in-up">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-primary tracking-wide">
            Powered by Advanced AI
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
        </div>

        {/* Headline with gradient animation */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight max-w-4xl mx-auto animate-fade-in-up stagger-1">
          Understand your{' '}
          <span className="text-gradient-animate">medical</span>{' '}
          <span className="text-gradient-secondary">documents</span>
          <br />
          <span className="text-gradient-success">instantly</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up stagger-2">
          Translate complex medical jargon into plain language with our{' '}
          <span className="text-primary font-semibold">AI-powered</span> platform.
          <br />
          <span className="text-sm text-muted-foreground/80 mt-2 block">
            Your privacy is our priority — nothing is ever stored.
          </span>
        </p>

        {/* CTA Button with glow effect */}
        <div className="mt-10 sm:mt-14 animate-fade-in-up stagger-3">
          <button
            onClick={onGetStarted}
            className="
              group relative inline-flex items-center justify-center
              h-14 px-10 rounded-full
              bg-gradient-to-r from-primary to-blue-600 text-white
              text-base font-semibold
              transition-all duration-300 ease-out
              hover:shadow-lg hover:shadow-primary/40
              active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            "
          >
            <span className="mr-2">Get Started</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-blue-600 opacity-30 blur-lg -z-10 transition-opacity group-hover:opacity-50" />
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-secondary" />
            <span>No sign-up required</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>100% Private</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <span>Seconds to results</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          FEATURES GRID
          ════════════════════════════════════════════ */}
      <div className="px-4 pb-24 sm:pb-32 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                description: 'Advanced language models analyze your documents and surface the information that matters most, in terms you actually understand.',
                iconColor: 'text-primary',
                iconBg: 'bg-primary/10',
                gradient: 'from-primary/5 to-primary/10',
              },
              {
                icon: Lock,
                title: 'Privacy First',
                description: 'Nothing is stored, logged, or shared. Your documents exist only in memory during processing and are wiped the moment you leave.',
                iconColor: 'text-secondary',
                iconBg: 'bg-secondary/10',
                gradient: 'from-secondary/5 to-secondary/10',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'From upload to full interpretation in under five seconds. No waiting, no queues — just the answers you need, right away.',
                iconColor: 'text-accent',
                iconBg: 'bg-accent/20',
                gradient: 'from-accent/5 to-accent/10',
              },
              {
                icon: Shield,
                title: 'Fully Encrypted',
                description: 'End-to-end encryption on every request. Your data never touches our servers in plain text. Your documents, your control.',
                iconColor: 'text-destructive',
                iconBg: 'bg-destructive/10',
                gradient: 'from-destructive/5 to-destructive/10',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`
                  group p-6 sm:p-8
                  rounded-2xl
                  border-0
                  bg-gradient-to-br ${feature.gradient}
                  shadow-lg hover:shadow-xl
                  transition-all duration-300 ease-out
                  hover:-translate-y-1
                  card-lift
                `}
              >
                <div className="flex items-start gap-5">
                  {/* Animated icon container */}
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0 ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════ */}
      <div className="bg-muted/40 py-20 sm:py-28 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center tracking-tight mb-4 animate-fade-in-up">
            How it works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16 animate-fade-in-up stagger-1">
            Three simple steps to go from confusing medical jargon to clear, actionable information.
          </p>

          <div className="relative">
            {/* Animated connector line */}
            <div className="absolute left-1/2 top-8 hidden sm:block -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="space-y-8 sm:space-y-0 sm:grid sm:gap-8 sm:grid-cols-3 relative">
              {[
                {
                  step: '01',
                  title: 'Upload',
                  description: 'Take a photo or upload a PDF, JPG, or PNG of your medical document.',
                  color: 'text-destructive',
                  bg: 'bg-destructive/10',
                  borderColor: 'border-destructive/20',
                  icon: '📤',
                },
                {
                  step: '02',
                  title: 'Analyze',
                  description: 'Our AI extracts key information, identifies medical terms, and interprets them instantly.',
                  color: 'text-accent',
                  bg: 'bg-accent/15',
                  borderColor: 'border-accent/20',
                  icon: '🔍',
                },
                {
                  step: '03',
                  title: 'Understand',
                  description: 'Receive a plain-language breakdown with warnings, definitions, and next steps.',
                  color: 'text-secondary',
                  bg: 'bg-secondary/10',
                  borderColor: 'border-secondary/20',
                  icon: '💡',
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center relative group animate-fade-in-up stagger-1">
                  {/* Step circle with glow */}
                  <div className={`
                    relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl ${item.bg} border ${item.borderColor} mb-6
                    transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20
                  `}>
                    <span className="text-3xl">{item.icon}</span>
                    <span className={`absolute -bottom-3 text-sm font-bold ${item.color} bg-background px-3 py-1 rounded-full shadow-sm`}>
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-[240px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          STATS SECTION
          ════════════════════════════════════════════ */}
      <div className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '92%', label: 'Accuracy', suffix: '+' },
              { value: '< 5s', label: 'Processing', suffix: '' },
              { value: '10MB', label: 'File Size', suffix: ' max' },
              { value: '100%', label: 'Private', suffix: '' },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl sm:text-5xl font-bold text-gradient-primary mb-2">
                  {stat.value}
                  <span className="text-lg sm:text-xl text-muted-foreground">{stat.suffix}</span>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          FAQ SECTION
          ════════════════════════════════════════════ */}
      <div className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center tracking-tight mb-3 animate-fade-in-up">
            Common questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-center mb-12 sm:mb-16 animate-fade-in-up stagger-1">
            Everything you need to know before getting started.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                q: 'What formats are supported?',
                a: 'JPG, PNG, and PDF files up to 10 MB. We handle scanned documents and photos with exceptional accuracy.',
              },
              {
                q: 'Is my data private?',
                a: 'Completely. Documents are never stored or shared. Data is wiped immediately after processing.',
              },
              {
                q: 'How accurate is this?',
                a: 'Our AI achieves 92%+ accuracy on medical documents. We always recommend confirming with your doctor.',
              },
              {
                q: 'Do I need an account?',
                a: 'No account or registration required. Completely free to use, no strings attached.',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className={`
                  p-5 sm:p-6
                  rounded-2xl
                  border border-border/60
                  bg-card
                  hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5
                  hover:border-primary/30
                  transition-all duration-300
                  card-lift
                  animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Animated checkmark */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Check className="h-5 w-5 text-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base sm:text-lg mb-2">
                      {item.q}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          BOTTOM CTA STRIP
          ════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 sm:py-28 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 blur-3xl rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight mb-6 animate-fade-in-up">
            Ready to understand your{' '}
            <span className="text-gradient-animate">medical documents</span>?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 animate-fade-in-up stagger-1">
            No sign-up needed. Just upload and get instant clarity.
          </p>
          <button
            onClick={onGetStarted}
            className="
              group relative inline-flex items-center justify-center
              h-14 px-10 rounded-full
              bg-gradient-to-r from-primary to-blue-600 text-white
              text-base font-semibold
              transition-all duration-300 ease-out
              hover:shadow-2xl hover:shadow-primary/40 hover:scale-105
              active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              animate-fade-in-up stagger-2
            "
          >
            <span className="mr-2">Get Started Free</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-blue-600 opacity-30 blur-xl -z-10 transition-opacity group-hover:opacity-50" />
          </button>
          
          {/* Trust badges */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in-up stagger-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-secondary" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
