
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Glowfolio helped me land my first paid partnership with a skincare brand I've been following for years!",
      name: "Sophia Martinez",
      role: "Beauty Creator, 18K followers",
      avatar: "SM"
    },
    {
      quote: "I used to spend hours creating media kits. With Glowfolio, I made a beautiful one in 5 minutes that brands actually respond to.",
      name: "Taylor Kim",
      role: "Fashion Influencer, 24K followers",
      avatar: "TK"
    },
    {
      quote: "The brand database is incredible. I found contacts I couldn't get anywhere else and landed 3 deals in my first month.",
      name: "Emma Johnson",
      role: "Lifestyle Creator, 15K followers",
      avatar: "EJ"
    }
  ];

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-4">
            Loved by <span className="text-glow-purple">creators</span> like you
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of micro-influencers using Glowfolio to land their dream brand deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="border border-border/40 bg-background overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <svg className="h-8 w-8 text-glow-purple/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-foreground italic leading-relaxed mb-4">"{testimonial.quote}"</p>
                  </div>
                  <div className="flex items-center mt-6">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-glow-purple/20 text-glow-purple flex items-center justify-center font-medium">
                        {testimonial.avatar}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
