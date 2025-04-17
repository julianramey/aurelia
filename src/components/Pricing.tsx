
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$28",
      description: "Perfect for beginning creators looking to land their first brand deals.",
      features: [
        "10 pitch emails/day",
        "Access to public brand email database",
        "Media kit hosting with template customization",
        "3 pitch templates",
        "Basic analytics"
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const
    },
    {
      name: "Pro",
      price: "$49",
      description: "For serious creators ready to scale their brand partnerships.",
      features: [
        "30 pitch emails/day",
        "Access to verified brand contacts (real people)",
        "Unlock all media kit templates",
        "All pitch templates",
        "Additional styling controls (fonts, colors)",
        "Priority kit analytics"
      ],
      popular: true,
      buttonText: "Go Pro",
      buttonVariant: "default" as const
    }
  ];

  return (
    <section id="pricing" className="py-24 px-4 bg-muted">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-4">
            Simple, transparent <span className="text-glow-purple">pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`border ${plan.popular ? 'border-glow-purple shadow-lg relative overflow-hidden' : 'border-border/40'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-glow-purple text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="pb-0">
                <h3 className="text-lg font-medium text-muted-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-glow-purple mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={plan.buttonVariant} 
                  className={`w-full ${plan.popular 
                    ? 'bg-glow-purple hover:bg-glow-secondary-purple text-white' 
                    : 'border-glow-purple/30 hover:border-glow-purple text-glow-purple'}`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Need a custom plan for your agency or brand? <a href="#" className="text-glow-purple underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
