
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create your account",
      description: "Sign up and complete your profile with your social media handles and creator details."
    },
    {
      number: "02",
      title: "Customize your media kit",
      description: "Choose from beautiful templates and add your brand colors, photos, and stats."
    },
    {
      number: "03",
      title: "Discover brands to pitch",
      description: "Browse our database of 5,000+ brands filtered by your niche and interests."
    },
    {
      number: "04",
      title: "Send professional pitches",
      description: "Use our pitch templates to send personalized emails that get responses."
    }
  ];

  return (
    <section id="howitworks" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-4">
            How <span className="text-glow-purple">Glowfolio</span> works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to transform your influence into paid brand collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 group">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-glow-purple/30 text-glow-purple font-medium group-hover:bg-glow-purple group-hover:text-white transition-colors">
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 bg-muted rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(155,135,245,0.1),rgba(255,255,255,0))]" />
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-display font-medium mb-4">Ready to start pitching?</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Join thousands of creators who are landing brand deals every day with Glowfolio.
            </p>
            <button className="bg-glow-purple hover:bg-glow-secondary-purple text-white px-8 py-3 rounded-xl text-lg font-medium transition-colors">
              Create Your Media Kit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
