
import React from 'react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_30%,rgba(155,135,245,0.12),rgba(255,255,255,0))]" />
      
      <div className="container mx-auto max-w-6xl relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="flex flex-col space-y-8 animate-fade-in">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight">
                Pitch brands.
                <br />
                Land collabs.
                <span className="text-glow-purple"> Glow up.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Create stunning media kits and pitch top brands in just minutes. 
                Turn your influence into income with Glowfolio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-glow-purple hover:bg-glow-secondary-purple text-white px-8 py-6 text-lg rounded-xl">
                Create Your Media Kit
              </Button>
              <Button variant="outline" className="border-glow-purple/30 hover:border-glow-purple text-glow-purple px-8 py-6 text-lg rounded-xl">
                See How It Works
              </Button>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-glow-soft-purple border-2 border-white" />
                ))}
              </div>
              <p>Loved by <span className="font-semibold text-foreground">2,000+</span> micro-influencers</p>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[540px] animate-float">
            <div className="absolute top-0 right-0 w-full h-full rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-xl animate-glow overflow-hidden">
              <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-glow-purple/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm">
                <h3 className="font-display text-lg font-medium">Your Media Kit</h3>
                <p className="text-sm text-muted-foreground mt-1">Ready to share with top brands</p>
              </div>
            </div>
            
            <div className="absolute top-6 -right-6 w-24 h-24 rounded-lg bg-glow-soft-peach rotate-6 animate-float-slow" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-lg bg-glow-soft-blue -rotate-12 animate-float-slow" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
