
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      title: "Media Kit Generator",
      description: "Create a professional media kit in minutes with customizable templates that showcase your best content.",
      icon: "✨",
      color: "bg-lavender/40"
    },
    {
      title: "Brand Discovery",
      description: "Access our database of 5,000+ brands looking to collaborate with creators in your niche.",
      icon: "🔍",
      color: "bg-blush/40"
    },
    {
      title: "Pitch Tool",
      description: "Send personalized pitches with professionally crafted templates optimized for brand responses.",
      icon: "📧",
      color: "bg-peach/40"
    },
    {
      title: "Analytics Dashboard",
      description: "Track your outreach progress and monitor which pitches get the best response rates.",
      icon: "📊",
      color: "bg-sage/40"
    },
    {
      title: "Custom Vanity URL",
      description: "Get your own branded link to share your professional media kit with potential partners.",
      icon: "🔗",
      color: "bg-blush/40"
    },
    {
      title: "Daily Pitch Tracker",
      description: "Stay organized with daily pitch quotas and reminders to follow up with brands.",
      icon: "📆",
      color: "bg-sage/40"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-sage/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-5">
            Everything you need to <span className="text-rose">land brand deals</span>
          </h2>
          <p className="text-taupe text-lg max-w-2xl mx-auto">
            Our all-in-one platform gives you the tools to create professional pitches,
            discover brands, and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="border-none shadow-none bg-transparent overflow-hidden group">
              <CardContent className="p-8">
                <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3 text-charcoal">{feature.title}</h3>
                <p className="text-taupe">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
