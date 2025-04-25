import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-white">
      <div className="container mx-auto max-w-5xl relative">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium leading-tight max-w-3xl mx-auto">
            Pitch brands.
            Land collabs.
            <span className="text-rose hover:italic transition-all duration-200 cursor-default"> Glow up.</span>
          </h1>
          <p className="mt-6 text-lg text-taupe max-w-xl mx-auto">
            Create stunning media kits and pitch top brands in just minutes. 
            Turn your influence into income with Glowfolio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link to={user ? "/dashboard" : "/login"}>
              <Button 
                variant="rose"
                className="px-8 py-6 text-lg rounded-full"
              >
                {user ? "Go to Dashboard" : "Create Your Media Kit"}
              </Button>
            </Link>
            <Link to="#howitworks">
              <Button 
                variant="outline" 
                className="border-rose/60 hover:border-rose text-charcoal px-8 py-6 text-lg rounded-full"
              >
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-4 text-sm text-taupe mt-10">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-lavender/70 border-2 border-white" />
              ))}
            </div>
            <p>Loved by <span className="font-medium text-charcoal">2,000+</span> content creators</p>
          </div>
        </div>

        <div className="relative h-[500px] max-w-4xl mx-auto">
          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-sm border border-border/20">
            <img 
              src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Glowfolio Media Kit Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-charcoal/30"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="font-sans text-xl font-medium">Your Media Kit</h3>
              <p className="text-sm text-white/80 mt-1">Ready to share with top brands</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
