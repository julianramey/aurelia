
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      title: "Media Kit Generator",
      description: "Create a professional media kit in minutes with customizable templates that showcase your best content.",
      icon: "✨",
      color: "bg-glow-soft-purple"
    },
    {
      title: "Brand Discovery",
      description: "Access our database of 5,000+ brands looking to collaborate with creators in your niche.",
      icon: "🔍",
      color: "bg-glow-soft-blue"
    },
    {
      title: "Pitch Tool",
      description: "Send personalized pitches with professionally crafted templates optimized for brand responses.",
      icon: "📧",
      color: "bg-glow-soft-peach"
    },
    {
      title: "Analytics Dashboard",
      description: "Track your outreach progress and monitor which pitches get the best response rates.",
      icon: "📊",
      color: "bg-glow-soft-green"
    },
    {
      title: "Custom Vanity URL",
      description: "Get your own branded link to share your professional media kit with potential partners.",
      icon: "🔗",
      color: "bg-glow-soft-yellow"
    },
    {
      title: "Daily Pitch Tracker",
      description: "Stay organized with daily pitch quotas and reminders to follow up with brands.",
      icon: "📆",
      color: "bg-glow-soft-pink"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-muted">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-4">
            Everything you need to <span className="text-glow-purple">land brand deals</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our all-in-one platform gives you the tools to create professional pitches,
            discover brands, and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="border border-border/40 bg-background/80 backdrop-blur overflow-hidden group hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
