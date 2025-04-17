
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full py-6 px-4 md:px-6 lg:px-8 border-b border-border/10 bg-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-display font-medium text-foreground">
              Glowfolio
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <Link to="#features" className="text-sm font-medium text-foreground/80 hover:text-glow-purple transition-colors">
            Features
          </Link>
          <Link to="#howitworks" className="text-sm font-medium text-foreground/80 hover:text-glow-purple transition-colors">
            How It Works
          </Link>
          <Link to="#pricing" className="text-sm font-medium text-foreground/80 hover:text-glow-purple transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" className="hidden sm:inline-flex text-foreground hover:bg-background/5">
            Login
          </Button>
          <Button className="bg-glow-purple hover:bg-glow-purple/90 text-white rounded-full px-6">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
