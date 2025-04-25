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
    <section id="pricing" className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-5 text-charcoal">
            Simple, transparent <span className="text-rose">pricing</span>
          </h2>
          <p className="text-taupe text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`border-rose/10 shadow-sm ${plan.popular ? 'ring-1 ring-rose' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4">
                  <div className="bg-rose text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="pb-6 pt-8">
                <h3 className="text-lg font-medium text-charcoal">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-semibold text-charcoal">{plan.price}</span>
                  <span className="text-taupe ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-taupe mb-8">{plan.description}</p>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-rose mr-3 flex-shrink-0" />
                      <span className="text-charcoal/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8">
                <Button 
                  variant={plan.buttonVariant} 
                  className={`w-full rounded-full px-6 py-6 ${plan.popular 
                    ? 'bg-rose hover:bg-rose/90 text-white' 
                    : 'border-rose/20 hover:border-rose text-charcoal hover:bg-white/50'}`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-taupe">
            Need a custom plan for your agency or brand? <a href="#" className="text-rose underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
