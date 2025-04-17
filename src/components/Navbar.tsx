
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-4 md:px-6 lg:px-8 border-b border-border/40">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-display font-semibold bg-clip-text text-transparent bg-purple-gradient">
              Glowfolio
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
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

        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden sm:inline-flex border-glow-purple/30 hover:border-glow-purple text-glow-purple">
            Login
          </Button>
          <Button className="bg-glow-purple hover:bg-glow-secondary-purple text-white">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
