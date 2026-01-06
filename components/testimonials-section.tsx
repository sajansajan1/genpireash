"use client";

import { Star } from "lucide-react";
import { Volkhov } from "next/font/google";
import Image from "next/image";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  rating: number;
  imageSrc: string;
}

function Testimonial({ quote, name, role, rating, imageSrc }: TestimonialProps) {
  return (
    <div className="glass-card dark:glass-card-dark rounded-xl p-8">
      <div className="flex mb-4">
        {Array(rating)
          .fill(0)
          .map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6 italic">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className={`font-semibold ${volkhov.className}`}>{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Genpire cut my product development time in half. The AI-generated specs are incredibly accurate.",
      name: "Sarah Johnson",
      role: "Fashion Designer",
      rating: 5,
      imageSrc: "/images/testimonials/sarah.png",
    },
    {
      quote: "Finding manufacturers used to be a nightmare. Now I can get multiple quotes within days.",
      name: "Michael Chen",
      role: "Startup Founder",
      rating: 5,
      imageSrc: "/images/testimonials/michael.png",
    },
    {
      quote: "The platform is intuitive and the supplier matching is spot on. Highly recommend!",
      name: "John Ramirez",
      role: "Product Manager",
      rating: 4,
      imageSrc: "/images/testimonials/john.png",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${volkhov.className}`}>What Beta Users Say</h2>
          <p className="text-lg text-[#1C1917] max-w-2xl mx-auto">
            Early access users are already seeing incredible results
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              rating={testimonial.rating}
              imageSrc={testimonial.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
