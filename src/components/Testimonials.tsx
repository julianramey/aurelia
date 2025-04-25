import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Glowfolio helped me land my first paid partnership with a lifestyle brand I've been following for years!",
      name: "Sophia Martinez",
      role: "Content Creator, 18K followers",
      avatar: "SM"
    },
    {
      quote: "I used to spend hours creating media kits. With Glowfolio, I made a beautiful one in 5 minutes that brands actually respond to.",
      name: "Taylor Kim",
      role: "Digital Creator, 24K followers",
      avatar: "TK"
    },
    {
      quote: "The brand database is incredible. I found contacts I couldn't get anywhere else and landed 3 deals in my first month.",
      name: "Emma Johnson",
      role: "Content Creator, 15K followers",
      avatar: "EJ"
    }
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-5 text-charcoal">
            Loved by <span className="text-rose">creators</span> like you
          </h2>
          <p className="text-taupe text-lg max-w-2xl mx-auto">
            Join thousands of content creators using Glowfolio to land their dream brand deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="border-none shadow-none bg-white overflow-hidden h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex-1">
                  <svg className="h-8 w-8 text-rose mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-charcoal leading-relaxed mb-6">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center mt-6 pt-6 border-t border-rose/20">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-white text-rose flex items-center justify-center font-medium">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-charcoal">{testimonial.name}</p>
                    <p className="text-xs text-taupe">{testimonial.role}</p>
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
