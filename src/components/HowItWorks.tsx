import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const HowItWorks = () => {
  const { user } = useAuth();
  
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
    <section id="howitworks" className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-5">
            How <span className="text-rose">Glowfolio</span> works
          </h2>
          <p className="text-taupe text-lg max-w-2xl mx-auto">
            Four simple steps to transform your influence into paid brand collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 group">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-rose/40 text-rose font-medium">
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-3 text-charcoal">{step.title}</h3>
                <p className="text-taupe">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-white rounded-3xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-display font-medium mb-5 text-charcoal">Ready to start pitching?</h3>
            <p className="text-taupe text-lg mb-8">
              Join thousands of creators who are landing brand deals every day with Glowfolio.
            </p>
            <Link to={user ? "/dashboard" : "/login"}>
              <Button className="bg-rose hover:bg-rose/90 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors">
                {user ? "Go to Dashboard" : "Create Your Media Kit"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
