import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Aurelia helped me land my first paid partnership with a lifestyle brand I've been following for years!",
      name: "Sarah L.",
      handle: "@sarahstyles",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      stars: 5
    },
    {
      quote: "I used to spend hours creating media kits. With Aurelia, I made a beautiful one in 5 minutes that brands actually respond to.",
      name: "Mike P.",
      handle: "@mikepmedia",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      stars: 5
    },
    {
      quote: "The brand database is incredible. I found contacts I couldn't get anywhere else and landed 3 deals in my first month.",
      name: "Emma Johnson",
      role: "Content Creator, 15K followers",
      avatar: "EJ"
    }
  ];

  return (
    <section className="bg-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-semibold text-charcoal">
            Loved by creators like you
          </h2>
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
                    <p className="text-xs text-taupe">{testimonial.handle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/signup" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-rose hover:bg-rose/90 md:py-4 md:text-lg md:px-10 shadow-md transition-transform hover:scale-105">
            Join thousands of content creators using Aurelia to land their dream brand deals.
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
